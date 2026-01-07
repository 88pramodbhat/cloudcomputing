@echo off
REM Portfolio Builder - Kubernetes Deployment Script for Windows

echo === Starting Portfolio Builder Microservices Deployment ===
echo.

REM Create namespace
echo [1/8] Creating namespace...
kubectl create namespace portfolio
echo.

REM Apply ConfigMaps and Secrets
echo [2/8] Applying ConfigMaps and Secrets...
kubectl apply -f k8s\configmaps\
kubectl apply -f k8s\secrets\
echo.

REM Deploy MongoDB
echo [3/8] Deploying MongoDB...
kubectl apply -f k8s\deployments\mongodb-deployment.yaml
echo.

REM Wait for MongoDB
echo [4/8] Waiting for MongoDB to be ready...
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n portfolio
echo.

REM Deploy Auth Service
echo [5/8] Deploying Auth Service...
kubectl apply -f k8s\deployments\auth-service-deployment.yaml
echo.

REM Deploy Profile Service
echo [6/8] Deploying Profile Service...
kubectl apply -f k8s\deployments\profile-service-deployment.yaml
echo.

REM Apply Services
echo [7/8] Creating Services...
kubectl apply -f k8s\services\
echo.

REM Apply Ingress
echo [8/8] Configuring Ingress...
kubectl apply -f k8s\ingress\
echo.

REM Wait for deployments
echo Waiting for all deployments to be ready...
kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n portfolio
kubectl wait --for=condition=available --timeout=300s deployment/profile-service -n portfolio
echo.

REM Display status
echo.
echo === Deployment Complete! ===
echo.
echo Deployment Status:
kubectl get pods -n portfolio
echo.
kubectl get services -n portfolio
echo.
kubectl get ingress -n portfolio
echo.

echo.
echo Portfolio Builder is now running!
echo Access the application at: http://portfolio.local
echo.
echo To check logs:
echo   kubectl logs -f deployment/auth-service -n portfolio
echo   kubectl logs -f deployment/profile-service -n portfolio
echo.

pause
