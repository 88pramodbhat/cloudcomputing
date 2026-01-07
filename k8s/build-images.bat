# Build and push Docker images script
@echo off

echo === Building Docker Images for Microservices ===
echo.

REM Set your Docker registry here
set REGISTRY=your-dockerhub-username

echo [1/2] Building Auth Service...
cd services\auth-service
docker build -t %REGISTRY%/auth-service:latest .
docker push %REGISTRY%/auth-service:latest
cd ..\..
echo.

echo [2/2] Building Profile Service...
cd services\profile-service
docker build -t %REGISTRY%/profile-service:latest .
docker push %REGISTRY%/profile-service:latest
cd ..\..
echo.

echo === All images built and pushed successfully! ===
echo.
echo Update the deployment files with your registry:
echo   - k8s/deployments/auth-service-deployment.yaml
echo   - k8s/deployments/profile-service-deployment.yaml
echo.
echo Replace "your-registry" with "%REGISTRY%"
echo.

pause
