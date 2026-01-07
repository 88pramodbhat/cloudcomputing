#!/bin/bash

# Portfolio Builder - Kubernetes Deployment Script

echo "🚀 Starting Portfolio Builder Microservices Deployment..."

# Create namespace
echo "📦 Creating namespace..."
kubectl create namespace portfolio

# Apply ConfigMaps and Secrets
echo "🔧 Applying ConfigMaps and Secrets..."
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/

# Deploy MongoDB
echo "🗄️  Deploying MongoDB..."
kubectl apply -f k8s/deployments/mongodb-deployment.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n portfolio

# Deploy Auth Service
echo "🔐 Deploying Auth Service..."
kubectl apply -f k8s/deployments/auth-service-deployment.yaml

# Deploy Profile Service
echo "👤 Deploying Profile Service..."
kubectl apply -f k8s/deployments/profile-service-deployment.yaml

# Apply Services
echo "🌐 Creating Services..."
kubectl apply -f k8s/services/

# Apply Ingress
echo "🚪 Configuring Ingress..."
kubectl apply -f k8s/ingress/

# Wait for deployments
echo "⏳ Waiting for all deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n portfolio
kubectl wait --for=condition=available --timeout=300s deployment/profile-service -n portfolio

# Display status
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n portfolio
echo ""
kubectl get services -n portfolio
echo ""
kubectl get ingress -n portfolio

echo ""
echo "🎉 Portfolio Builder is now running!"
echo "Access the application at: http://portfolio.local"
echo ""
echo "To check logs:"
echo "  kubectl logs -f deployment/auth-service -n portfolio"
echo "  kubectl logs -f deployment/profile-service -n portfolio"
