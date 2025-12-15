# Aula: Configurando VirtualService no Istio

## Contexto da Aula

* Cluster Kubernetes **já com Istio instalado**
* Aplicação rodando com **sidecar Envoy**
* Objetivo: **introduzir e configurar o VirtualService**
* Próxima aula: **DestinationRule** (dependência importante)

---

## O que é VirtualService?

* Recurso do **Istio (CRD – Custom Resource Definition)**
* Faz parte da API: `networking.istio.io`
* Permite **controle avançado de roteamento** sem alterar a aplicação
* Atua **acima do Service do Kubernetes** (não substitui o Service)

👉 O *Service* continua existindo e resolvendo DNS
👉 O *VirtualService* define **como o tráfego chega até o Service**

---

## Para que serve o VirtualService?

Principais casos de uso:

* **Traffic Shaping** (divisão de tráfego)
* **Canary Deployment**
* **A/B Testing**
* **Roteamento por path** (ex: `/a` → `/b`)
* **Rewrite de URL**
* **Timeout**
* **Retry**
* **Fault Injection**

💡 Vantagem: essas regras saem da aplicação e ficam na **infraestrutura (service mesh)**

---

## Relação com DestinationRule

* O VirtualService **define o roteamento**
* O DestinationRule **define os subsets (v1, v2, etc.)**
* Nesta aula:

  * Criamos o VirtualService
  * Alguns erros são esperados **por não existir o DestinationRule ainda**

---

## Estrutura Básica do Manifesto

### 1️⃣ API Version

```yaml
apiVersion: networking.istio.io/v1
```

* Antigamente era comum `v1alpha3`
* Hoje, o recomendado é **v1**

---

### 2️⃣ Kind

```yaml
kind: VirtualService
```

---

### 3️⃣ Metadata

```yaml
metadata:
  name: app-service-mesh-howtos
```

* Nome do recurso no cluster

---

### 4️⃣ Spec

É onde ficam as regras de roteamento.

---

## Definindo o Host

```yaml
spec:
  hosts:
    - app-service-mesh
```

* O `host` aponta para o **Service do Kubernetes**
* Pode ser:

  * Nome curto: `app-service-mesh`
  * FQDN: `app-service-mesh.svc.cluster.local`

📌 O Service **precisa existir no cluster**

---

## Configuração de HTTP Routing

### Exemplo simples

```yaml
spec:
  hosts:
    - app-service-mesh
  http:
    - route:
        - destination:
            host: app-service-mesh
            subset: v1
          weight: 80
        - destination:
            host: app-service-mesh
            subset: v2
          weight: 20
```

---

## Entendendo os Conceitos

### 🔹 Route

* Lista de destinos possíveis

### 🔹 Destination

* Para onde o tráfego será enviado

### 🔹 Subset

* Representa uma **versão lógica do serviço** (ex: v1, v2)
* **Depende do DestinationRule**

### 🔹 Weight

* Percentual de tráfego (0–100)
* Exemplo:

  * 80% → v1
  * 20% → v2

📌 Usado para:

* Canary Deployment
* A/B Testing
* Traffic Shaping

---

## Importante sobre Subsets

* `subset` **não é a tag da imagem do container**
* É apenas um nome lógico
* O vínculo real acontece no **DestinationRule**, via labels do Pod

---

## Aplicando o VirtualService

```bash
kubectl apply -f virtualservice.yaml
```

* Pode aplicar o arquivo específico
* Ou aplicar a pasta inteira (`kubectl apply -f k8s/`)
* Operação **idempotente**

---

## Como Visualizar o VirtualService

### 🔹 Via Lens

* Custom Resources
* Networking → Istio
* VirtualService

---

### 🔹 Via Kiali (Recomendado para debug)

* Aba **Istio Config**
* Mostra:

  * VirtualServices
  * Warnings e erros

#### Erros vistos na aula:

* ❌ Host não encontrado
* ❌ Subset não encontrado

👉 Motivo: **DestinationRule ainda não foi criado**

---

## Aula Seguinte: Configurando DestinationRule no Istio

## O que é DestinationRule?

* Recurso do **Istio (CRD)**
* Faz parte da mesma API: `networking.istio.io/v1`
* Trabalha em conjunto com o **VirtualService**

👉 Enquanto o **VirtualService define *como* o tráfego é roteado**, o **DestinationRule define *para onde* esse tráfego pode ir**.

---

## Papel do DestinationRule na Arquitetura

* Define **subsets** (v1, v2, etc.)
* Aplica **políticas de conexão** para os destinos
* Permite configurar:

  * Load Balancing
  * Circuit Breaker
  * Outlier Detection

📌 Sem DestinationRule:

* Subsets não existem
* VirtualService gera warnings no Kiali

---

## Relação VirtualService x DestinationRule

| Recurso         | Responsabilidade                                        |
| --------------- | ------------------------------------------------------- |
| VirtualService  | Regras de roteamento (percentual, path, retry, timeout) |
| DestinationRule | Definição dos destinos e políticas de conexão           |

---

## Criando o Manifesto do DestinationRule

### Estrutura Básica

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: app-service-mesh-dr
spec:
  host: app-service-mesh
```

* `host` deve apontar para o **Service do Kubernetes**

---

## Definindo Subsets

### Exemplo com V1 e V2

```yaml
spec:
  host: app-service-mesh
  subsets:
    - name: v1
      labels:
        app: app-service-mesh
    - name: v2
      labels:
        app: app-service-mesh
```

---

## Entendendo os Subsets

* `name`:

  * Deve **bater exatamente** com o `subset` usado no VirtualService
* `labels`:

  * São as **labels dos Pods** definidas no Deployment
  * Funcionam como Service Discovery

📌 Importante:

* Subsets diferentes **precisam de labels diferentes**
* Caso contrário, o tráfego não será realmente dividido

---

## Situação da Aula (Configuração Parcial)

* V1 e V2 existem como subsets
* Porém:

  * Ambos apontam para **a mesma label**
  * Resultado:

    * 100% do tráfego vai para a mesma aplicação

👉 Split de tráfego é **lógico**, mas não efetivo

---

## Aplicando o DestinationRule

```bash
kubectl apply -f destinationrule.yaml
```

* Recurso criado com sucesso
* Visível em:

  * Lens → Custom Resources → DestinationRule

---

## Validação no Kiali

Após criar o DestinationRule:

* Warnings do VirtualService desaparecem
* Subsets passam a existir
* Kiali mostra:

  * VirtualService ✅
  * DestinationRule ✅

📌 Mesmo com status OK, o tráfego ainda não está realmente separado

---

## Limitação Atual (Importante)

* Deployments ainda usam a **mesma label**
* Não existem Pods distintos para V1 e V2
* O split configurado não reflete versões reais

➡️ Próxima aula:

* Criar **Deployments separados**
* Usar labels diferentes (version: v1 / v2)
* Validar o split de tráfego na prática

---

## Conclusão Geral (VS + DR)

* VirtualService:

  * Define o *como* do tráfego
* DestinationRule:

  * Define o *para onde* do tráfego
* Ambos são obrigatórios para:

  * Canary Deployments
  * A/B Testing
  * Traffic Shaping real

---

## Resumo Final (Checklist)

* [ ] Service Kubernetes criado
* [ ] VirtualService configurado
* [ ] DestinationRule criado
* [ ] Subsets definidos
* [ ] Labels corretas nos Pods
* [ ] Validação no Kiali
