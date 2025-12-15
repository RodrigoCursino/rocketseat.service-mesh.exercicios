# Passo a passo: Cluster Kind com Istio, App e Observabilidade

Este guia descreve **do zero** como criar um cluster Kubernetes com **Kind**, instalar o **Istio**, subir uma aplicação com **sidecar**, configurar **Kiali, Prometheus, Jaeger** e executar um **teste de carga**.

---

## 1️⃣ Criar o cluster Kubernetes com Kind

```bash
kind create cluster --config=infra/kind.yaml
```

📌 Cria um cluster local usando o arquivo de configuração definido em `infra/kind.yaml`.

---

## 2️⃣ Acessar e validar o cluster

```bash
kubectl cluster-info --context kind-cluster-service-mesh
```

✔️ Confirma que o cluster está ativo e acessível.

---

## 3️⃣ Instalar o istioctl

👉 Siga o **passo 1** do arquivo:

```
instalacao_istio.md
```

📌 O `istioctl` é a CLI usada para instalar e gerenciar o Istio.

---

## 4️⃣ Instalar o Istio no cluster

```bash
istioctl install
```

✔️ Aceite as opções padrão quando solicitado.

---

## 5️⃣ Verificar se o Istio foi instalado

```bash
kubectl get pods -n istio-system
```

✔️ Todos os pods devem estar em **Running**.

---

## 6️⃣ Criar o namespace da aplicação

```bash
kubectl apply -f app-ts/k8s/namespace.yaml
```

📌 Namespace isolado para a aplicação que fará parte da service mesh.

---

## 7️⃣ Criar o Deployment da aplicação

```bash
kubectl apply -f app-ts/k8s/deployment.yaml
```

---

## 8️⃣ Criar o Service da aplicação

```bash
kubectl apply -f app-ts/k8s/service.yaml
```

📌 O Service será usado como **host** pelo VirtualService e DestinationRule.

---

## 9️⃣ Verificar Deployment e Service

```bash
kubectl get deployments -n app-mesh
kubectl get services -n app-mesh
```

---

## 🔟 Verificar os Pods da aplicação

```bash
kubectl get pods -n app-mesh
```

---

## 1️⃣1️⃣ Habilitar injeção automática do sidecar Istio

```bash
kubectl label namespace app-mesh istio-injection=enabled --overwrite
```

📌 Alternativa: definir essa label diretamente no YAML do namespace.

---

## 1️⃣2️⃣ Reiniciar os Pods para aplicar o sidecar

```bash
kubectl rollout restart deployment app-service-mesh -n app-mesh
```

📌 Necessário para que o **Envoy sidecar** seja injetado nos Pods.

---

## 1️⃣3️⃣ Verificar novamente os Pods

```bash
kubectl get pods -n app-mesh
```

✔️ Os Pods agora devem ter **2 containers** (app + istio-proxy).

---

## 1️⃣4️⃣ Baixar o manifesto do Kiali

```bash
wget https://raw.githubusercontent.com/istio/istio/refs/heads/master/samples/addons/kiali.yaml
```

📌 Salve o arquivo na pasta `infra/`.

---

## 1️⃣5️⃣ Instalar o Kiali

```bash
kubectl apply -f infra/kiali.yaml
```

---

## 1️⃣6️⃣ Verificar se o Kiali foi instalado

```bash
kubectl get pods -n istio-system
```

---

## 1️⃣7️⃣ Configurar a Kubernetes Gateway API

```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
{ kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.4.0" | kubectl apply -f -; }
```

📌 Necessário para recursos modernos de gateway no Kubernetes.

---

## 1️⃣8️⃣ Baixar o manifesto do Prometheus

```bash
wget https://raw.githubusercontent.com/istio/istio/refs/heads/master/samples/addons/prometheus.yaml
```

📌 Salve na pasta `infra/`.

---

## 1️⃣9️⃣ Instalar o Prometheus

```bash
kubectl apply -f infra/prometheus.yaml
```

---

## 2️⃣0️⃣ Verificar o Prometheus

```bash
kubectl get pods -n istio-system
```

---

## 2️⃣1️⃣ Baixar o manifesto do Jaeger

```bash
wget https://raw.githubusercontent.com/istio/istio/refs/heads/master/samples/addons/jaeger.yaml
```

📌 Salve na pasta `infra/`.

---

## 2️⃣2️⃣ Instalar o Jaeger

```bash
kubectl apply -f infra/jaeger.yaml
```

---

## 2️⃣3️⃣ Verificar o Jaeger

```bash
kubectl get pods -n istio-system
```

---

## 2️⃣4️⃣ Executar teste de carga com Fortio

```bash
kubectl run -it fortio -n app-mesh --rm \
  --image=fortio/fortio \
  -- load -qps 8000 -t 60s -c 35 "http://app-service-mesh-svc/healthz"
```

📌 Teste de carga para:

* Gerar métricas no Prometheus
* Visualizar tráfego no Kiali
* Analisar traces no Jaeger

---

## ✅ Resultado Final Esperado

* Cluster Kind funcionando
* Istio instalado
* Aplicação com sidecar Envoy
* Kiali, Prometheus e Jaeger ativos
* Tráfego visível na service mesh