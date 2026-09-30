/**
 * Database Seeder Script
 * Populates MongoDB with demo users, 8 restaurants, 45+ dishes, coupons, and sample live orders.
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { usersData, couponsData, restaurantsData, getDishesData } = require('./seedData');
const { generateRouteWaypoints } = require('../services/riderSimulationService');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting FoodVerse database seeding process...');

    // 1. Clear existing documents
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🧹 Purged existing collections.');

    // 2. Insert Users (User.pre('save') handles bcrypt hashing)
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`👤 Created ${createdUsers.length} initial users (Customer, Restaurant Admin, Delivery Partner).`);

    const customerUser = createdUsers.find(u => u.role === 'customer');
    const adminUser = createdUsers.find(u => u.role === 'restaurant_admin');
    const deliveryUser = createdUsers.find(u => u.role === 'delivery_partner');

    // 3. Insert Coupons
    await Coupon.insertMany(couponsData);
    console.log(`🎟️ Created ${couponsData.length} discount coupons.`);

    // 4. Insert Restaurants
    const restaurantMap = {};
    for (let i = 0; i < restaurantsData.length; i++) {
      const restData = {
        ...restaurantsData[i],
        owner: i === 0 ? adminUser._id : null,
      };
      const createdRest = await Restaurant.create(restData);
      restaurantMap[createdRest.name] = createdRest._id;

      if (i === 0) {
        adminUser.managedRestaurant = createdRest._id;
        await adminUser.save();
      }
    }
    console.log(`🏪 Created ${restaurantsData.length} restaurants.`);

    // 5. Insert Dishes
    const dishesList = getDishesData(restaurantMap);
    const createdDishes = await Dish.insertMany(dishesList);
    console.log(`🍔 Created ${createdDishes.length} gourmet menu items.`);

    // 6. Create sample orders for immediate demonstration
    const nebulaId = restaurantMap['Nebula Burger Lab'];
    const nebulaRest = await Restaurant.findById(nebulaId);
    const burgerDish = createdDishes.find(d => d.name.includes('Interstellar Truffle'));
    const friesDish = createdDishes.find(d => d.name.includes('Parmesan Truffle'));

    if (nebulaRest && burgerDish && friesDish) {
      const startLat = nebulaRest.location.lat;
      const startLng = nebulaRest.location.lng;
      const destLat = customerUser.address.lat;
      const destLng = customerUser.address.lng;
      const routePolyline = generateRouteWaypoints(startLat, startLng, destLat, destLng, 25);

      // Order 1: Active In-Transit Order (Out for Delivery)
      await Order.create({
        orderNumber: 'FV-78294',
        customer: {
          user: customerUser._id,
          name: customerUser.name,
          email: customerUser.email,
          phone: customerUser.phone,
        },
        restaurant: {
          restaurantId: nebulaRest._id,
          name: nebulaRest.name,
          image: nebulaRest.image,
          address: `${nebulaRest.address.street}, ${nebulaRest.address.city}`,
          location: { lat: startLat, lng: startLng },
        },
        deliveryPartner: {
          user: deliveryUser._id,
          name: deliveryUser.name,
          phone: deliveryUser.phone,
          vehicleNumber: 'SF-E-BIKE-904',
          vehicleType: 'Electric High-Speed Scooter',
          rating: 4.9,
          avatar: deliveryUser.avatar,
        },
        items: [
          {
            dish: burgerDish._id,
            name: burgerDish.name,
            price: burgerDish.price,
            quantity: 2,
            isVeg: burgerDish.isVeg,
            image: burgerDish.image,
            model3dType: 'burger',
          },
          {
            dish: friesDish._id,
            name: friesDish.name,
            price: friesDish.price,
            quantity: 1,
            isVeg: friesDish.isVeg,
            image: friesDish.image,
            model3dType: 'fries',
          },
        ],
        pricing: {
          subtotal: 38.97,
          tax: 3.12,
          deliveryFee: 1.99,
          discount: 10.0,
          total: 34.08,
        },
        coupon: { code: 'FOODVERSE50', discount: 10.0 },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'Out for Delivery',
        deliveryAddress: customerUser.address,
        liveLocation: {
          lat: routePolyline[6].lat,
          lng: routePolyline[6].lng,
          heading: 45,
          speedKmh: 30,
          currentStepIndex: 6,
          totalSteps: routePolyline.length,
        },
        routePolyline,
        statusTimeline: [
          { status: 'Placed', timestamp: new Date(Date.now() - 25 * 60000), note: 'Order placed by customer' },
          { status: 'Accepted', timestamp: new Date(Date.now() - 22 * 60000), note: 'Restaurant confirmed order' },
          { status: 'Preparing', timestamp: new Date(Date.now() - 15 * 60000), note: 'Kitchen preparing your food' },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 5 * 60000), note: 'Rider is en route with your food' },
        ],
        estimatedDeliveryMinutes: 12,
        estimatedDeliveryTime: new Date(Date.now() + 12 * 60000),
      });

      // Order 2: Delivered Order with 5-star Review
      const novaId = restaurantMap['Nova Pizza & Woodfired Crusts'];
      const novaRest = await Restaurant.findById(novaId);
      const pizzaDish = createdDishes.find(d => d.name.includes('Signature Margherita'));

      if (novaRest && pizzaDish) {
        await Order.create({
          orderNumber: 'FV-64109',
          customer: {
            user: customerUser._id,
            name: customerUser.name,
            email: customerUser.email,
            phone: customerUser.phone,
          },
          restaurant: {
            restaurantId: novaRest._id,
            name: novaRest.name,
            image: novaRest.image,
            address: `${novaRest.address.street}, ${novaRest.address.city}`,
            location: { lat: novaRest.location.lat, lng: novaRest.location.lng },
          },
          deliveryPartner: {
            name: 'Sam Ryder',
            phone: '+1 (555) 432-8765',
            vehicleNumber: 'SF-E-BIKE-904',
            rating: 4.9,
          },
          items: [
            {
              dish: pizzaDish._id,
              name: pizzaDish.name,
              price: pizzaDish.price,
              quantity: 1,
              isVeg: pizzaDish.isVeg,
              image: pizzaDish.image,
              model3dType: 'pizza',
            },
          ],
          pricing: {
            subtotal: 18.99,
            tax: 1.52,
            deliveryFee: 0.0,
            discount: 0.0,
            total: 20.51,
          },
          paymentMethod: 'card',
          paymentStatus: 'paid',
          orderStatus: 'Delivered',
          deliveryAddress: customerUser.address,
          statusTimeline: [
            { status: 'Placed', timestamp: new Date(Date.now() - 3600000 * 24), note: 'Order placed' },
            { status: 'Delivered', timestamp: new Date(Date.now() - 3600000 * 23), note: 'Delivered to door' },
          ],
          deliveredAt: new Date(Date.now() - 3600000 * 23),
          review: {
            rating: 5,
            comment: 'Crust was crispy and light, truly authentic woodfired flavor! Fast delivery too.',
            createdAt: new Date(Date.now() - 3600000 * 22),
          },
        });
      }
      console.log(`📦 Seeded sample active and completed orders.`);
    }

    console.log('✅ Database Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    throw error;
  }
};

// If run directly from terminal: `node src/seed/seeder.js`
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
