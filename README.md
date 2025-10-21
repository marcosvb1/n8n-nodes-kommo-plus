# n8n-nodes-kommo-plus

Enhanced n8n node for Kommo CRM with advanced features and improved API handling.

## 🚀 Features

- ✅ **Entity Links**: Complete support for linking/unlinking entities (leads, contacts, companies, customers, catalog elements)
- ✅ **Complex Lead Creation**: Create leads with embedded contacts in one request
- ✅ **Enhanced Unsorted**: Fixed functionality for unsorted leads management
- ✅ **Improved Simplify Output**: Consistent data simplification across all resources
- ✅ **Custom Field Filters**: Advanced filtering for invoices and other resources
- ✅ **Rate Limiting**: Optimized API request handling (5 req/s)
- ✅ **Error Handling**: Better error messages and debugging
- ✅ **Dynamic Field Discovery**: Automatic custom field ID detection
- ✅ **Batch Operations**: Support for batch create/update operations

## 📦 Installation

```bash
npm install n8n-nodes-kommo-plus
```

## 🔧 Usage

1. Add the **Kommo+** node to your n8n workflow
2. Configure your Kommo credentials:
   - **OAuth2** (recommended for production)
   - **Long-lived token** (for development/testing)
3. Select the resource and operation you need
4. Configure the parameters and execute

## 📋 Resources Available

### Core Resources
- **Account**: Get account information
- **Leads**: Get, create, update, complex creation with contacts
- **Contacts**: Full CRUD operations with custom fields
- **Companies**: Full CRUD operations
- **Customers**: Full CRUD operations with status management
- **Invoices**: Get, create, update with custom field filters
- **Tasks**: Full CRUD operations
- **Notes**: Full CRUD operations
- **Lists**: Catalog management and elements
- **Unsorted**: Lead management from unsorted queue
- **Webhooks**: Webhook subscription management

### 🆕 Entity Links (NEW!)
The Entity Links resource allows you to:
- **Get Links**: Retrieve existing links between entities
- **Link Entities**: Create links between entities (leads, contacts, companies, customers, catalog elements)
- **Unlink Entities**: Remove links between entities
- **Metadata Support**: 
  - `main_contact` for contact relationships
  - `quantity` and `catalog_id` for catalog elements
  - `updated_by` for audit trails

## 🔗 Entity Links Examples

### Link a Contact to a Lead
```json
{
  "entity_id": 123,
  "to_entity_id": 456,
  "to_entity_type": "contacts",
  "metadata": {
    "main_contact": true
  }
}
```

### Link a Catalog Element to a Lead
```json
{
  "entity_id": 123,
  "to_entity_id": 789,
  "to_entity_type": "catalog_elements",
  "metadata": {
    "quantity": 2,
    "catalog_id": 1
  }
}
```

## 🎯 Advanced Features

### Complex Lead Creation
Create leads with embedded contacts in a single API call:
- Lead data with custom fields
- Multiple contacts with their own custom fields
- Link to existing companies
- Automatic status assignment

### Custom Field Filters
Advanced filtering capabilities:
- Filter invoices by custom fields
- Date range filters
- Multiple value filters
- Dynamic field loading from API

### Simplify Output
Consistent data simplification across all resources:
- Removes API noise (`_links`)
- Preserves useful data (`_embedded`)
- Recursive simplification of nested objects
- Maintains data integrity

## 🔧 Configuration

### Authentication
Choose between two authentication methods:

1. **OAuth2** (Recommended)
   - More secure
   - Automatic token refresh
   - Better for production use

2. **Long-lived Token**
   - Simpler setup
   - Good for development
   - Manual token management

### Rate Limiting
- Configured for 5 requests per second
- Automatic retry with exponential backoff
- Global request queuing
- Respects Kommo API limits

## 🐛 Troubleshooting

### Common Issues

1. **"Field not found" errors**
   - Ensure custom fields exist in your Kommo account
   - Check field IDs are correct
   - Use the dynamic field loading features

2. **Rate limit exceeded**
   - The node automatically handles rate limiting
   - Reduce concurrent requests if needed
   - Check your Kommo plan limits

3. **Authentication errors**
   - Verify credentials are correct
   - Check token expiration (for long-lived tokens)
   - Ensure proper OAuth2 setup

### Debug Mode
Enable debug logging by setting the node parameter `simplify` to `false` to see raw API responses.

## 📈 Performance

- **Optimized API calls**: Batch operations where possible
- **Smart caching**: Reduces redundant API requests
- **Efficient pagination**: Handles large datasets
- **Memory management**: Processes data in chunks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/marcosvb1/n8n-nodes-kommo-plus.git
cd n8n-nodes-kommo-plus
npm install
npm run build
```

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration provided
- Add tests for new features
- Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the n8n community
- Based on Kommo API v4
- Inspired by the original n8n-nodes-kommo project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/marcosvb1/n8n-nodes-kommo-plus/issues)
- **Documentation**: [Kommo API Docs](https://www.amocrm.ru/developers/content/crm_platform)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

---

Made with ❤️ by [Digital Profits](https://digitalprofits.com.br)
