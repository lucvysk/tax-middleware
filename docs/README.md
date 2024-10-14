

# Tax Protocol for RRS

A reference app implementing a VTEX IO Tax Protocol service.

## Uses
Depending of the payment method selected and the giftcard used, the `DISCOUNTADJUST` will be applied.

```json
[
    {
        "id": "Items",
        "name": "Items Total",
        "value": 10000
    },
    {
        "id": "Discounts",
        "name": "Discounts Total",
        "value": -1000
    },
    {
        "id": "Shipping",
        "name": "Shipping Total",
        "value": 0
    },
    {
        "id": "CustomTax",
        "name": "STATE",
        "value": 387
    },
    {
        "id": "CustomTax",
        "name": "COUNTY",
        "value": 90
    },
    {
        "id": "CustomTax",
        "name": "DISTRICT",
        "value": 63
    },
    {
        "id": "CustomTax",
        "name": "DISCOUNTADJUST",
        "value": 500
    }
]
```

