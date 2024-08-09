import { Jwt } from "jsonwebtoken";

declare namespace NodeJS {
    interface ProcessEnv {
        TEST_VAR: string;
    }
}