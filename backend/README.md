# Backend

## MongoDB Schema

### User

- \_id
- email
- password
- Profile { Object }
  - first_name
  - last_name
  - birthday
  - phone
- role
- address { Array }
  - name
  - phone
  - label
  - address_line
  - sub_district
  - district
  - province
  - zip_code
  - detail
  - is_default
- tax_address { Array }
  - tax_id
  - company_name
  - branch
  - address ref: 'address'
- wishlist { Array } ref: 'Product'
- createdAt
- updatedAt

### Product

- \_id
- sku
- name
- slug
- category_id ref: 'Category'
- brand ref: 'Brand'
- model_number
- series
- description
- image
- sell_price
- market_price
- discount
- quantity
- weight_g
- dimensions
  - length
  - width
  - height
- track_serial
- low_stock_alert
- warranty_period
- warranty_provider
- search_keywords
- filters
  - key
  - label
  - value
- specifications
  - key
  - label
  - value
  - unit
- is_active
