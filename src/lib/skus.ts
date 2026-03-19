export const MASTER_SKUS: Record<string, string> = {
    'TWC-CIN-6PK': 'Cinnamon Cereal',
    'TWC-COA-6PK': 'Cocoa Cereal',
    'TWC-FRT-6PK': 'Fruity Cereal',
    'TWC-FRO-6PK': 'Frosted Cereal',
    'TWC-HNY-6PK': 'Honey Cereal',
    'TWC-UNS-6PK': 'Unsweetened Cereal',
    'TWC-STW-6PK': 'Strawberry Cereal',
    'TWC-MSM-6PK': 'Marshmallow Cereal',
    'TWC-BBM-18PK': 'Blueberry Muffin',
    'TWC-CCS-18PK': 'Cereal Large Format',
    'TWC-CTC-18PK': 'Cotton Candy',
    'TWG-CAL-8PK': 'Granola — California',
    'TWG-MAP-8PK': 'Granola — Maple Pecan',
    'TWG-ORG-8PK': 'Granola — Original',
    'TWB-CHC-12PK': 'Bar — Chocolate',
    'TWB-CPB-12PK': 'Bar — Cinnamon Peanut Butter',
    'TWB-SMO-12PK': "Bar — S'mores",
}

export const isKnownSku = (sku: string): boolean => sku in MASTER_SKUS
