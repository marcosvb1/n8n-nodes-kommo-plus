# 🔧 Correção do Parâmetro "With"

## Problema Identificado

**Sintoma:** Parâmetro "Include" (with) não estava sendo enviado para a API em:
- ❌ Customers
- ❌ Tasks

Mesmo tendo o campo na UI, o valor não era aplicado nas requisições.

## Causa

**Faltava processamento do parâmetro** no código execute:

```typescript
// ❌ ANTES (customers/tasks)
const options = this.getNodeParameter('options', 0) as {
  sort: { ... };
  // Sem with?: string[]
};
// Sem qs.with = ...
```

## Solução Aplicada

**Adicionado processamento em 2 arquivos:**

```typescript
// ✅ DEPOIS
const options = this.getNodeParameter('options', 0) as {
  sort: { ... };
  with?: string[];  // ✅ Tipado
};

qs.with = options.with ? options.with.join(',') : undefined;  // ✅ Processa
```

**Arquivos corrigidos:**
- ✅ `resources/customers/get/execute.ts`
- ✅ `resources/tasks/get/execute.ts`

## Resultado

Agora TODOS os resources que têm campo "Include/With" processam corretamente:

✅ Leads → processa `with`  
✅ Contacts → processa `with`  
✅ Companies → processa `with`  
✅ Customers → processa `with` (corrigido)  
✅ Tasks → processa `with` (corrigido)  

## Como Usar

No n8n, em "Options" → "Include":
- Selecione relacionamentos para incluir (contacts, companies, etc)
- A API retornará os dados embedded na resposta
- Evita múltiplas requisições!

**Exemplo prático:**

Sem `with`:
```http
GET /api/v4/customers?limit=50
# Retorna apenas customers
```

Com `with=contacts,companies`:
```http
GET /api/v4/customers?limit=50&with=contacts,companies
# Retorna customers + contacts + companies em uma requisição!
```

**Economia:** 1 request ao invés de 3! 🚀

---

**Data:** 2025-10-20  
**Status:** ✅ Corrigido
