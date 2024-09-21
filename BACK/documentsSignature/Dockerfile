FROM amazoncorretto:17.0.12-al2

WORKDIR /app
CMD ["./gradlew","clean","bootJar"]
COPY build/libs/*.jar app.jar

ENTRYPOINT ["java","-jar","app.jar"]