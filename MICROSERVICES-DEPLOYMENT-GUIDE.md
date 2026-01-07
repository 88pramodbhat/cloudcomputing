# Portfolio Builder - Microservices Architecture with Kubernetes

## 🏗️ Architecture Overview

This application has been restructured into a **microservices architecture** with the following services:

### Services:
1. **Auth Service** (Port 3001) - Handles user authentication and JWT token management
2. **Profile Service** (Port 3002) - Manages user portfolio data
3. **MongoDB** - Shared database for all services

## 📁 Project Structure

```
cloudcomputing2/
├── services/
│   ├── auth-service/
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── profile-service/
│   │   ├── models/
│   │   │   └── Profile.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── frontend-service/ (Optional - for UI)
├── k8s/
│   ├── deployments/
│   │   ├── mongodb-deployment.yaml
│   │   ├── auth-service-deployment.yaml
│   │   └── profile-service-deployment.yaml
│   ├── services/
│   │   └── services.yaml
│   ├── configmaps/
│   │   └── app-config.yaml
│   ├── secrets/
│   │   └── jwt-secret.yaml
│   ├── ingress/
│   │   └── ingress.yaml
│   ├── deploy.bat (Windows)
│   ├── deploy.sh (Linux/Mac)
│   └── build-images.bat
└── README.md
```

## 🚀 Deployment Instructions

### Prerequisites

1. **Kubernetes Cluster** (Minikube, Docker Desktop, or cloud provider)
2. **kubectl** CLI installed and configured
3. **Docker** for building images
4. **NGINX Ingress Controller** installed in your cluster

### Step 1: Install NGINX Ingress Controller

```bash
# For Minikube
minikube addons enable ingress

# For Docker Desktop
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# For other clusters
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml
```

### Step 2: Build and Push Docker Images

1. Update your Docker Hub username in `k8s/build-images.bat`:
   ```batch
   set REGISTRY=your-dockerhub-username
   ```

2. Build and push images:
   ```batch
   cd k8s
   build-images.bat
   ```

3. Update the deployment files with your registry:
   - `k8s/deployments/auth-service-deployment.yaml`
   - `k8s/deployments/profile-service-deployment.yaml`
   
   Replace `your-registry` with your Docker Hub username.

### Step 3: Deploy to Kubernetes

**On Windows:**
```batch
cd k8s
deploy.bat
```

**On Linux/Mac:**
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

### Step 4: Configure Local DNS (Optional)

Add to your hosts file:
```
127.0.0.1 portfolio.local
```

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Linux/Mac:** `/etc/hosts`

### Step 5: Access the Application

```
http://portfolio.local
```

## 📊 API Endpoints

### Auth Service (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify` | Verify JWT token |
| GET | `/api/auth/user/:userId` | Get user by ID |
| GET | `/health` | Health check |

### Profile Service (port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get own profile (authenticated) |
| GET | `/api/profile/:userId` | Get profile by user ID |
| POST | `/api/profile` | Create/Update profile (authenticated) |
| DELETE | `/api/profile` | Delete profile (authenticated) |
| GET | `/health` | Health check |

## 🔐 Authentication Flow

1. User registers via `/api/auth/register`
2. Receives JWT token
3. Includes token in Authorization header: `Bearer <token>`
4. Profile service verifies token with auth service
5. Access granted to protected resources

## 🛠️ Useful Kubernetes Commands

```bash
# Check pod status
kubectl get pods -n portfolio

# Check services
kubectl get svc -n portfolio

# Check ingress
kubectl get ingress -n portfolio

# View logs
kubectl logs -f deployment/auth-service -n portfolio
kubectl logs -f deployment/profile-service -n portfolio

# Scale services
kubectl scale deployment auth-service --replicas=3 -n portfolio

# Delete deployment
kubectl delete namespace portfolio
```

## 🔧 Configuration

### Environment Variables

**Auth Service:**
- `PORT`: Service port (default: 3001)
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

**Profile Service:**
- `PORT`: Service port (default: 3002)
- `MONGO_URL`: MongoDB connection string
- `AUTH_SERVICE_URL`: Auth service URL

### Kubernetes Resources

**ConfigMaps:**
- `mongodb-config`: MongoDB connection settings
- `auth-service-config`: Auth service configuration
- `profile-service-config`: Profile service configuration

**Secrets:**
- `jwt-secret`: JWT secret key (Base64 encoded)

## 📈 Monitoring & Health Checks

Each service exposes a `/health` endpoint:
```bash
curl http://auth-service:3001/health
curl http://profile-service:3002/health
```

## 🐛 Troubleshooting

### Pods not starting?
```bash
kubectl describe pod <pod-name> -n portfolio
kubectl logs <pod-name> -n portfolio
```

### Cannot access ingress?
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress rules
kubectl describe ingress portfolio-ingress -n portfolio
```

### Database connection issues?
```bash
# Check MongoDB pod
kubectl get pod -l app=mongodb -n portfolio

# Test connection
kubectl exec -it <mongodb-pod> -n portfolio -- mongo
```

## 🌟 Features

✅ **Microservices Architecture**  
✅ **JWT-based Authentication**  
✅ **Kubernetes Orchestration**  
✅ **Horizontal Pod Autoscaling Ready**  
✅ **Health Checks & Liveness Probes**  
✅ **Resource Limits & Requests**  
✅ **Service Discovery**  
✅ **Ingress Routing**  
✅ **ConfigMaps & Secrets Management**  
✅ **Persistent Storage for MongoDB**  

## 📝 Next Steps

1. **Add CI/CD Pipeline** (GitHub Actions, Jenkins)
2. **Implement Monitoring** (Prometheus, Grafana)
3. **Add Logging** (ELK Stack, Fluentd)
4. **Configure Auto-scaling** (HPA)
5. **Set up HTTPS/TLS** (cert-manager)
6. **Implement Rate Limiting**
7. **Add API Gateway** (Kong, Traefik)

## 🤝 Contributing

For any issues or improvements, please create an issue or pull request.

## 📄 License

MIT License
