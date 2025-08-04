import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Property Management APIs",
        description: "",
    },
    host: "",
    schemes: ["http"],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};

const outputFile = "./swagger.json";
const routes = ["./server/src/routes/index.ts"];    

swaggerAutogen(outputFile, routes, doc);
