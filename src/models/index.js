import Dimension from './dimension.model.js';
import StackConfig from './stack_config.model.js';
import Order from './order.model.js';
import OrderItem from './order_item.model.js';
import Bundle from './bundle.model.js';

// N:M: Order ↔ Dimension a través de OrderItem
Order.belongsToMany(Dimension, { through: OrderItem, foreignKey: 'orderId', otherKey: 'dimensionId', as: 'dimensions' });
Dimension.belongsToMany(Order, { through: OrderItem, foreignKey: 'dimensionId', otherKey: 'orderId', as: 'orders' });

// Dimension → StackConfig (N:1, default config)
Dimension.belongsTo(StackConfig, { foreignKey: 'defaultStackConfigId', as: 'defaultStackConfig' });
StackConfig.hasMany(Dimension, { foreignKey: 'defaultStackConfigId', as: 'dimensionsUsingDefault' });

// Order ↔ OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Dimension ↔ OrderItem (1:N)
Dimension.hasMany(OrderItem, { foreignKey: 'dimensionId', as: 'orderItems' });
OrderItem.belongsTo(Dimension, { foreignKey: 'dimensionId', as: 'dimension' });

// OrderItem ↔ Bundle (1:N)
OrderItem.hasMany(Bundle, { foreignKey: 'orderItemId', as: 'bundles' });
Bundle.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });

// StackConfig ↔ Bundle (1:N)
StackConfig.hasMany(Bundle, { foreignKey: 'stackConfigId', as: 'bundles' });
Bundle.belongsTo(StackConfig, { foreignKey: 'stackConfigId', as: 'stackConfig' });

export { Dimension, StackConfig, Order, OrderItem, Bundle };
