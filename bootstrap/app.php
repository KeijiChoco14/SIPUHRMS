<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpException;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (UnauthorizedException $e, Request $request) {
            $message = 'You do not have the required permissions or role to access this page or module.';
            if ($request->is('api/*') || $request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return Inertia::render('Error', [
                'status' => 403,
                'title' => 'Access Denied (403 Forbidden)',
                'message' => $message,
            ])->toResponse($request)->setStatusCode(403);
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            $message = $e->getMessage() ?: 'You do not have permission to perform this action.';
            if ($request->is('api/*') || $request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return Inertia::render('Error', [
                'status' => 403,
                'title' => 'Access Denied (403 Forbidden)',
                'message' => $message,
            ])->toResponse($request)->setStatusCode(403);
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 403) {
                $message = $e->getMessage() ?: 'You do not have permission to access this page or module.';
                if ($request->is('api/*') || $request->expectsJson() || $request->wantsJson()) {
                    return response()->json(['message' => $message], 403);
                }

                return Inertia::render('Error', [
                    'status' => 403,
                    'title' => 'Access Denied (403 Forbidden)',
                    'message' => $message,
                ])->toResponse($request)->setStatusCode(403);
            }
        });
    })->create();

if (isset($_ENV['APP_STORAGE'])) {
    $app->useStoragePath($_ENV['APP_STORAGE']);
}

return $app;
