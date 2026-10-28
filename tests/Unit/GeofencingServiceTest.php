<?php

namespace Tests\Unit;

use App\Models\AttendanceLocation;
use App\Services\GeofencingService;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class GeofencingServiceTest extends TestCase
{
    protected GeofencingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GeofencingService();
    }

    public function test_calculate_distance_between_identical_points_is_zero(): void
    {
        $lat = 0.49909785;
        $lon = 101.41851615;

        $distance = $this->service->calculateDistance($lat, $lon, $lat, $lon);

        $this->assertEquals(0.0, $distance);
    }

    public function test_calculate_distance_accurate_for_known_coordinates(): void
    {
        // Swiss-Belinn SKA Pekanbaru
        $hotelLat = 0.49909785;
        $hotelLon = 101.41851615;

        // Mall SKA entrance (~180 meters away)
        $mallLat = 0.50050000;
        $mallLon = 101.41900000;

        $distance = $this->service->calculateDistance($hotelLat, $hotelLon, $mallLat, $mallLon);

        $this->assertGreaterThan(100.0, $distance);
        $this->assertLessThan(300.0, $distance);
    }

    public function test_coordinates_validation_throws_for_invalid_latitude(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->assertValidCoordinates(95.0, 101.0);
    }

    public function test_coordinates_validation_throws_for_invalid_longitude(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->assertValidCoordinates(0.5, 185.0);
    }

    public function test_validate_location_accepts_when_within_radius(): void
    {
        $location = new AttendanceLocation([
            'name' => 'Swiss-Belinn SKA Pekanbaru',
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'radius_meters' => 100,
            'min_accuracy_meters' => 150,
            'is_active' => true,
        ]);

        // Point very close to hotel (~10m away)
        $userLat = 0.49915000;
        $userLon = 101.41855000;

        $result = $this->service->validateLocation($userLat, $userLon, 15.0, $location);

        $this->assertTrue($result['valid']);
        $this->assertLessThanOrEqual(100.0, $result['distance']);
        $this->assertNull($result['reason']);
    }

    public function test_validate_location_rejects_when_outside_radius(): void
    {
        $location = new AttendanceLocation([
            'name' => 'Swiss-Belinn SKA Pekanbaru',
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'radius_meters' => 50,
            'min_accuracy_meters' => 150,
            'is_active' => true,
        ]);

        // Point ~1km away
        $userLat = 0.51000000;
        $userLon = 101.42000000;

        $result = $this->service->validateLocation($userLat, $userLon, 10.0, $location);

        $this->assertFalse($result['valid']);
        $this->assertEquals('outside_radius', $result['reason']);
        $this->assertGreaterThan(50.0, $result['distance']);
    }

    public function test_validate_location_rejects_when_accuracy_too_low(): void
    {
        $location = new AttendanceLocation([
            'name' => 'Swiss-Belinn SKA Pekanbaru',
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'radius_meters' => 100,
            'min_accuracy_meters' => 50,
            'is_active' => true,
        ]);

        // Position is inside radius, but GPS accuracy is 180m error
        $result = $this->service->validateLocation(0.49909785, 101.41851615, 180.0, $location);

        $this->assertFalse($result['valid']);
        $this->assertEquals('low_accuracy', $result['reason']);
    }

    public function test_validate_location_rejects_when_location_inactive(): void
    {
        $location = new AttendanceLocation([
            'name' => 'Inactive Hotel Location',
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'radius_meters' => 100,
            'min_accuracy_meters' => 150,
            'is_active' => false,
        ]);

        $result = $this->service->validateLocation(0.49909785, 101.41851615, 10.0, $location);

        $this->assertFalse($result['valid']);
        $this->assertEquals('location_inactive', $result['reason']);
    }
}
