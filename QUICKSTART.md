# Quick Start Guide - Microservices Deployment

## 🎯 What's Been Done

Your portfolio builder has been transformed into a **microservices architecture** with **Kubernetes orchestration**!

## 📦 Microservices Created

### 1. **Auth Service** (`services/auth-service/`)
- **Purpose**: User authentication & JWT token management
- **Port**: 3001
- **Endpoints**:
  - POST `/api/auth/register` - Register user
  - POST `/api/auth/login` - Login user
  - POST `/api/auth/verify` - Verify token
  - GET `/api/auth/user/:userId` - Get user info

### 2. **Profile Service** (`services/profile-service/`)
- **Purpose**: Portfolio/profile data management  
- **Port**: 3002
- **Endpoints**:
  - GET `/api/profile` - Get own profile
  - POST `/api/profile` - Create/update profile
  - GET `/api/profile/:userId` - Get user profile
  - DELETE `/api/profile` - Delete profile

### 3. **MongoDB**
- **Purpose**: Shared database
- **Port**: 27017
- **Storage**: 5GB persistent volume

## 🚀 Quick Deployment (3 Steps)

### Step 1: Build Docker Images
```bash
# Edit k8s/build-images.bat and set your Docker Hub username
set REGISTRY=your-dockerhub-username

# Run build script
cd k8s
build-images.bat
```

### Step 2: Update Deployments
Edit these files and replace `your-registry` with your Docker Hub username:
- `k8s/deployments/auth-service-deployment.yaml` (line 18)
- `k8s/deployments/profile-service-deployment.yaml` (line 18)

### Step 3: Deploy to Kubernetes
```bash
# Make sure kubectl is configured
kubectl cluster-info

# Deploy everything
cd k8s
deploy.bat
```

## 🌐 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           NGINX Ingress Controller              │
│         (portfolio.local routing)               │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼──────────┐
│  Auth Service  │  │ Profile Service  │
│   (Port 3001)  │  │   (Port 3002)    │
│   Replicas: 2  │  │   Replicas: 2    │
└───────┬────────┘  └───────┬──────────┘
        │                   │
        └─────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │     MongoDB      │
         │   (Port 27017)   │
         │  Persistent Vol  │
         └──────────────────┘
```

## 🔑 Key Features

✅ **Scalable**: Each service can scale independently  
✅ **Resilient**: 2 replicas per service for high availability  
✅ **Secure**: JWT-based authentication  
✅ **Isolated**: Services communicate via internal APIs  
✅ **Cloud-Ready**: Deploy to any Kubernetes cluster  
✅ **Production-Ready**: Health checks, resource limits, probes  

## 📊 Kubernetes Resources Created

| Resource | Count | Purpose |
|----------|-------|---------|
| Deployments | 3 | MongoDB, Auth, Profile services |
| Services | 3 | Internal service discovery |
| ConfigMaps | 3 | Configuration management |
| Secrets | 1 | JWT secret key |
| PVC | 1 | MongoDB persistent storage |
| Ingress | 1 | External routing |
| Namespace | 1 | Resource isolation |

## 🛠️ Useful Commands

```bash
# Check status
kubectl get all -n portfolio

# View logs
kubectl logs -f deployment/auth-service -n portfolio

# Scale up
kubectl scale deployment auth-service --replicas=5 -n portfolio

# Delete everything
kubectl delete namespace portfolio
```

## 🎓 Testing the APIs

### 1. Register a User
```bash
curl -X POST http://portfolio.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://portfolio.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create Profile (with token)
```bash
curl -X POST http://portfolio.local/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bio": "Full Stack Developer",
    "phone": "123-456-7890",
    "skills": [{"name": "Node.js"}, {"name": "React"}]
  }'
```

## 🎉 You're Done!

Your portfolio builder is now running as microservices on Kubernetes!

**Access**: `http://portfolio.local`

For detailed documentation, see: `MICROSERVICES-DEPLOYMENT-GUIDE.md`
