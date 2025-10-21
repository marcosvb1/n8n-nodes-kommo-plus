# 🔧 Correção do Simplify Output

## Problema Identificado

**Sintoma:** Simplify Output não funcionava corretamente em contacts, customers e outros resources:
- Contacts: retornava "This is an item, but it's empty"
- Customers: retornava apenas `{ id: 60 }` sem dados completos
- Leads: funcionava, mas de forma inconsistente

## Causa Raiz

**Duplo Processamento:**

```
Operations faziam:
  responseData → extractEmbedded → returnJsonArray() → INodeExecutionData[]
  
Router tentava fazer:
  INodeExecutionData[] → returnJsonArray() → ERRO (duplo wrapping)
```

As operations estavam fazendo `this.helpers.returnJsonArray()` internamente, mas o **router TAMBÉM fazia** `this.helpers.returnJsonArray()` nas linhas 103-106.

Resultado: dados eram processados 2 vezes, causando estruturas quebradas.

---

## Solução Aplicada

**Padrão Único:** Operations retornam dados RAW, router processa.

### Antes (ERRADO):
```typescript
// Operation
export async function execute(...): Promise<INodeExecutionData[]> {
  const simplify = this.getNodeParameter('simplify', 0, true);
  
  if (simplify) {
    const contacts = responseData?._embedded?.contacts ?? [];
    return this.helpers.returnJsonArray(contacts);  // ❌ 1º wrapping
  }
  return this.helpers.returnJsonArray(responseData);
}

// Router
const normalized = simplify ? simplifyPayload(responseData) : responseData;
const executionData = this.helpers.constructExecutionMetaData(
  this.helpers.returnJsonArray(normalized),  // ❌ 2º wrapping
  { itemData: { item: i } }
);
```

### Depois (CORRETO):
```typescript
// Operation - retorna dados RAW
export async function execute(...): Promise<IDataObject | IDataObject[]> {
  // Sem ler parâmetro simplify
  // Sem chamar returnJsonArray
  
  if (returnAll) {
    const pages = await apiRequestAllItems.call(...);
    return pages.flatMap((page: any) => page?._embedded?.contacts ?? []);
  }

  const responseData = await apiRequest.call(...);
  return responseData?._embedded?.contacts ?? responseData;  // ✅ Apenas extrai
}

// Router - faz TODO o processamento
const normalized = simplify ? simplifyPayload(responseData) : responseData;
const executionData = this.helpers.constructExecutionMetaData(
  this.helpers.returnJsonArray(normalized),  // ✅ Único wrapping
  { itemData: { item: i } }
);
```

---

## Arquivos Corrigidos

| Resource | Arquivo | Mudança |
|----------|---------|---------|
| **Leads** | leads/get/execute.ts | ✅ Remove simplify + returnJsonArray |
| **Contacts** | contacts/get/execute.ts | ✅ Remove simplify + returnJsonArray |
| **Companies** | companies/get/execute.ts | ✅ Remove simplify + returnJsonArray |
| **Customers** | customers/get/execute.ts | ✅ Remove simplify + returnJsonArray |
| **Lists** | lists/get/execute.ts | ✅ Remove simplify + returnJsonArray |
| **Invoices** | invoices/get/execute.ts | ✅ Remove simplify + returnJsonArray |

---

## Conceito do Simplify

### Com Simplify ON (default):
```json
// Usuário recebe array limpo
[
  { "id": 123, "name": "Lead 1", "price": 1000 },
  { "id": 456, "name": "Lead 2", "price": 2000 }
]
```

### Com Simplify OFF:
```json
// Usuário recebe resposta HAL+JSON completa
{
  "_embedded": {
    "leads": [
      { "id": 123, "name": "Lead 1", "_links": {...} },
      { "id": 456, "name": "Lead 2", "_links": {...} }
    ]
  },
  "_links": { "self": {...}, "next": {...} }
}
```

---

## Fluxo Correto

```
1. User clica "Execute"
2. Operation executa
   └─ apiRequest() retorna HAL+JSON
   └─ Operation extrai _embedded.RESOURCE
   └─ Retorna array de objetos RAW
   
3. Router recebe array RAW
   └─ Aplica simplifyPayload() se simplify = true
   └─ Chama returnJsonArray() UMA VEZ
   └─ constructExecutionMetaData()
   
4. User recebe dados corretos! ✅
```

---

## Resultado

✅ Todos os resources agora retornam dados consistentes  
✅ Simplify funciona uniformemente  
✅ Sem duplo processamento  
✅ Código mais simples e limpo  

---

## Estatísticas

```
26 arquivos modificados
48 inserções
855 deleções
-807 linhas no total!
```

---

**Correção aplicada em:** 2025-10-20  
**Impacto:** ALTO (afeta visualização de todos os GET operations)  
**Status:** ✅ RESOLVIDO

