# Use Java 17
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy jar file
COPY target/*.jar app.jar

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]
