<?php

namespace App\Services;

use App\Models\AttendanceLocation;
use InvalidArgumentException;

class GeofencingService
{
    /**
     * Mean Earth Radius in meters (WGS84 spherical approximation)
     */
    public const EARTH_RADIUS_METERS = 6371000.0;

    /**
     * Calculate the great-circle distance between two coordinates using the Haversine formula.
     *
     * @param float $lat1 Latitude of point 1 in degrees
     * @param float $lon1 Longitude of point 1 in degrees
     * @param float $lat2 Latitude of point 2 in degrees
     * @param float $lon2 Longitude of point 2 in degrees
     * @return float Distance in meters
     * @throws InvalidArgumentException
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $this->assertValidCoordinates($lat1, $lon1);
        $this->assertValidCoordinates($lat2, $lon2);

        // Identical point check
        if ($lat1 === $lat2 && $lon1 === $lon2) {
            return 0.0;
        }

        $lat1Rad = deg2rad($lat1);
        $lon1Rad = deg2rad($lon1);
        $lat2Rad = deg2rad($lat2);
        $lon2Rad = deg2rad($lon2);

        $deltaLat = $lat2Rad - $lat1Rad;
        $deltaLon = $lon2Rad - $lon1Rad;

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
            cos($lat1Rad) * cos($lat2Rad) *
            sin($deltaLon / 2) * sin($deltaLon / 2);

        // Clamp $a to [0, 1] to prevent domain errors in asin
        $a = max(0.0, min(1.0, $a));

        $c = 2 * asin(sqrt($a));

        return round(self::EARTH_RADIUS_METERS * $c, 2);
    }

    /**
     * Validate user location against an AttendanceLocation.
     *
     * @param float $userLat
     * @param float $userLon
     * @param float|null $accuracy
     * @param AttendanceLocation $location
     * @return array{valid: bool, distance: float, accuracy: float|null, radius: int, reason: string|null, message: string}
     */
    public function validateLocation(float $userLat, float $userLon, ?float $accuracy, AttendanceLocation $location): array
    {
        if (!$location->is_active) {
            return [
                'valid' => false,
                'distance' => 0.0,
                'accuracy' => $accuracy,
                'radius' => $location->radius_meters,
                'reason' => 'location_inactive',
                'message' => 'Attendance location is currently inactive.',
            ];
        }

        if ($location->radius_meters <= 0) {
            return [
                'valid' => false,
                'distance' => 0.0,
                'accuracy' => $accuracy,
                'radius' => $location->radius_meters,
                'reason' => 'invalid_radius',
                'message' => 'Attendance location has an invalid radius configured.',
            ];
        }

        try {
            $this->assertValidCoordinates($userLat, $userLon);
            $this->assertValidCoordinates($location->latitude, $location->longitude);
        } catch (InvalidArgumentException $e) {
            return [
                'valid' => false,
                'distance' => 0.0,
                'accuracy' => $accuracy,
                'radius' => $location->radius_meters,
                'reason' => 'invalid_coordinates',
                'message' => $e->getMessage(),
            ];
        }

        // Check GPS Accuracy threshold if configured
        if ($accuracy !== null && $location->min_accuracy_meters > 0) {
            if ($accuracy > $location->min_accuracy_meters) {
                $distance = $this->calculateDistance($userLat, $userLon, $location->latitude, $location->longitude);
                return [
                    'valid' => false,
                    'distance' => $distance,
                    'accuracy' => $accuracy,
                    'radius' => $location->radius_meters,
                    'reason' => 'low_accuracy',
                    'message' => "GPS accuracy is too low ({$accuracy}m). Maximum accepted error is {$location->min_accuracy_meters}m.",
                ];
            }
        }

        $distance = $this->calculateDistance($userLat, $userLon, $location->latitude, $location->longitude);

        // Inclusive distance check: distance <= radius is considered inside
        if ($distance <= (float) $location->radius_meters) {
            return [
                'valid' => true,
                'distance' => $distance,
                'accuracy' => $accuracy,
                'radius' => $location->radius_meters,
                'reason' => null,
                'message' => 'Location successfully verified within hotel geofence.',
            ];
        }

        return [
            'valid' => false,
            'distance' => $distance,
            'accuracy' => $accuracy,
            'radius' => $location->radius_meters,
            'reason' => 'outside_radius',
            'message' => "You are {$distance}m away from the hotel. Attendance requires you to be within {$location->radius_meters}m.",
        ];
    }

    /**
     * Validate coordinates are within geographic boundaries.
     */
    public function assertValidCoordinates(float $lat, float $lon): void
    {
        if ($lat < -90.0 || $lat > 90.0) {
            throw new InvalidArgumentException("Latitude must be between -90 and 90 degrees. Received: {$lat}");
        }

        if ($lon < -180.0 || $lon > 180.0) {
            throw new InvalidArgumentException("Longitude must be between -180 and 180 degrees. Received: {$lon}");
        }
    }
}
