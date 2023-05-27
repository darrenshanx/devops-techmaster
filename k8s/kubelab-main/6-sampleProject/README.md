## Giới thiệu và mục tiêu bài lab

Bài lab tổng hợp với thao tác build và deploy một ưng dụng Java Maven lên môi trường Kubernetes

project demo được lấy tại github: [https://github.com/liamhubian/techmaster-obo-web](https://github.com/liamhubian/techmaster-obo-web)

## Chuẩn bị

Để hoàn thành bài lab, người học cần chuẩn bị:

- Cài đặt kubectl trên client
- Cluster Kubernetes đang hoạt động và người học có khả năng kết nối tới cluster này
- Có thể sử dụng các công cụ như minikube, docker-desktop kubernetes, KinD,... trên môi trường lab
- thực hiện cấu hình alias trên terminal bằng command "alias k=kubectl"

## Các bước thực hiện

### Bước 0: tạo cluster với KinD

```bash
$ kind create cluster --config kind.conf --name demo
```

### Bước 1: triển khai cơ sở dữ liệu MySQL trong Docker

Tạo container `mysql` cùng db obo

```bash
$ docker run -d --network kind -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123 -e MYSQL_DATABASE=obo mysql:latest
```

Copy `obo.sql` vào `mysql` và thực hiện import data ban đầu vào db obo:

```bash
$ docker cp obo.sql mysql:/

$ docker exec -it mysql bash

$ mysql -u root -p obo < obo.sql
```

Lấy IP của `mysql` container

```bash
$ docker network inspect kind
```


### Bước 2: cài đặt ứng dụng và đóng gói dưới dạng container

Cập nhật lại config database trong file cấu hình `/src/main/resources/application-dev.properties`. Đổi lại các thông tin bên dưới thành các biến của OS environment.

```java
# DATABASE
spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/obo?createDatabaseIfNotExist=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
server.port=8080
```

Build obo-web từ file Dockerfile 

```bash
$ docker build -t darrenshanx/obo-web:1.0 .

$ docker login

$ docker push darrenshanx/obo-web:1.0
```

### Bước 3: triển khai ứng dụng trên môi trường Kubernetes

Tạo configmap template:

```bash
$ kubectl create configmap obo-web-configmap --dry-run=client -o yaml > templates/obo-web-configmap.yaml
```

Thêm các biến môi trường **DB_HOST** (IP của `mysql` đã lấy ở trên) vào file configmap template đã tạo trên:

```bash
apiVersion: v1
kind: ConfigMap
metadata:
  creationTimestamp: null
  name: obo-web-configmap
data:
  DB_HOST: "172.19.0.5"
```

Tạo Secret `template obo-web-secret.yaml`:

```bash
apiVersion: v1
kind: Secret
metadata:
  name: obo-web-secret
type: Opaque
stringData:
  DB_USER: "root"
  DB_PASSWORD: "123"
```
Tạo deployment template:

```bash
$ kubectl create deployment obo-web --dry-run=client --image darrenshanx/obo-web:1.1 -o yaml > templates/obo-web-deployment.yaml
```

Thêm cấu hình `configMap` và `Secret` vào `obo-web-deployment.yaml`:

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: obo-web
  name: obo-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: obo-web
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: obo-web
    spec:
      containers:
      - image: darrenshanx/obo-web:1.1
        name: obo-web
        envFrom:
          - configMapRef:
              name: obo-web-configmap
	        - secretRef:
              name: obo-web-secret
        resources: {}
status: {}
```

Apply template:

```bash
$ kubectl create -f templates/obo-web-secret.yaml

$ kubectl create -f templates/obo-web-configmap.yaml

$ kubectl create -f templates/obo-web-deployment.yaml
```

Kiểm tra các tài nguyên đã được tạo trên cụm hay chưa:

```bash
$ kubectl get all
```

### Bước 4: truy cập tới ứng dụng
```bash
$ kubectl port-forward deploy/obo-web --address 0.0.0.0 8080:8080
```

<img src="images/obo-web.png" width="60%">

### Clean up
Sau khi hoàn thành bài lab, học viên thực hiện xóa các tài nguyên
```bash
kubectl delete -f templates/
```
