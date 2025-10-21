# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- **Entity Links Resource**: Complete support for linking/unlinking entities
  - Get Links: Retrieve existing links between entities
  - Link Entities: Create links with metadata support
  - Unlink Entities: Remove links between entities
  - Support for all entity types: leads, contacts, companies, customers, catalog_elements
  - Metadata support: main_contact, quantity, catalog_id, updated_by

- **Complex Lead Creation**: Create leads with embedded contacts in one request
  - Support for multiple contacts with custom fields
  - Link to existing companies
  - Batch creation capabilities
  - Automatic status assignment

- **Enhanced Custom Field Filters**: Advanced filtering for invoices
  - Filter by custom fields with dynamic loading
  - Date range filters (created_at, updated_at)
  - Multiple value filters
  - ID-based filtering

- **Improved Simplify Output**: Consistent data simplification across all resources
  - Removes API noise (_links) while preserving useful data (_embedded)
  - Recursive simplification of nested objects
  - Maintains data integrity for related entities
  - Works with `with` parameter for related data

- **Dynamic Field Discovery**: Automatic custom field ID detection
  - No more hardcoded field IDs
  - Works across different Kommo accounts
  - Automatic catalog field detection for transactions

### Fixed
- **Unsorted Resource**: Complete functionality restoration
  - Fixed endpoint URLs (forms, reject methods)
  - Corrected HTTP methods (POST instead of DELETE for reject)
  - Fixed parameter indexing issues
  - Improved response parsing for unsorted items
  - Dynamic pipeline selection with API loading

- **Rate Limiting**: Optimized API request handling
  - Proper 5 req/s rate limiting implementation
  - Global request queuing
  - Automatic retry with exponential backoff
  - Removed excessive console logging

- **Node Icon**: Fixed logo display issues
  - Corrected icon path references
  - Ensured proper file distribution
  - Fixed both node and credential icons

- **Parameter Processing**: Fixed `with` parameter handling
  - Added missing `with` parameter support in customers and tasks
  - Proper query string formatting
  - Consistent parameter processing across resources

- **Error Handling**: Improved error messages and debugging
  - Better error context information
  - Cleaner console output
  - More descriptive error messages

### Changed
- **Package Name**: Changed from `n8n-nodes-kommo-improved` to `n8n-nodes-kommo-plus`
- **Version**: Bumped to 1.0.0 for stable release
- **API Request Handling**: Improved request/response processing
- **Data Transformation**: Enhanced payload simplification
- **Metadata Handling**: Better metadata processing for entity links

### Technical Improvements
- **TypeScript**: Enhanced type definitions and interfaces
- **Code Quality**: Improved code organization and modularity
- **Performance**: Optimized API calls and data processing
- **Documentation**: Comprehensive README and code documentation
- **Testing**: Better error handling and validation

## [0.1.26] - Previous Version

### Features from Previous Versions
- Basic CRUD operations for all resources
- OAuth2 and Long-lived token authentication
- Custom fields support
- Pagination and filtering
- Batch operations
- Webhook management
- Notes and tasks management
- Company and contact management
- Lead management with pipelines
- Customer and invoice management

---

## Migration Guide

### From Previous Versions

1. **Update Package Name**: Change from `n8n-nodes-kommo-improved` to `n8n-nodes-kommo-plus`
2. **New Features**: Entity Links resource is now available
3. **Improved Simplify**: Output is now more consistent across all resources
4. **Better Error Handling**: More descriptive error messages

### Breaking Changes
- None in this release - fully backward compatible

### Deprecated Features
- None in this release

---

## Roadmap

### Future Versions
- [ ] Additional entity types support
- [ ] Enhanced webhook management
- [ ] Advanced reporting features
- [ ] Bulk operations improvements
- [ ] Real-time sync capabilities

---

For more information, see the [README](README.md) and [GitHub repository](https://github.com/marcosvb1/n8n-nodes-kommo-plus).
