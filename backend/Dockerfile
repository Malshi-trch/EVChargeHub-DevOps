# ==============================================================
# Stage 1: Build the Spring Boot application using Maven & Java 21
# ==============================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Maven descriptor first to leverage Docker layer caching
COPY pom.xml .

# Download dependencies offline (cached layer)
RUN mvn dependency:go-offline -B

# Copy project source code
COPY src ./src

# Build production JAR without executing unit tests during container build
RUN mvn clean package -DskipTests=true

# ==============================================================
# Stage 2: Lightweight, secure production runtime
# ==============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for robust container health checks
RUN apk add --no-cache curl

# Security best practice: Run container as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable fat-JAR from the builder stage
COPY --from=builder /build/target/evchargehub-backend-1.0.0.jar app.jar

# Spring Boot backend port
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]

