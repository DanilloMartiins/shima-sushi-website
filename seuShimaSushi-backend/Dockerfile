# Build stage
FROM maven:3.9.6-eclipse-temurin-21 as builder

WORKDIR /build

COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

RUN mvn dependency:go-offline -q

COPY src src

RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from builder
COPY --from=builder /build/target/seu-shima-sushi-backend-*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

# Expose port (default 8080, can be overridden)
EXPOSE ${SERVER_PORT:-8080}

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]