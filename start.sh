#!/bin/sh

echo "Waiting for database to be ready..."
while ! nc -z mi-mariadb 3306; do
  sleep 1
done
echo "Database is ready!"

# Run database setup
echo "Running database setup..."
npx ts-node ./SQL/setupDatabase.ts

# Start the application
echo "Starting application..."
npm run start 