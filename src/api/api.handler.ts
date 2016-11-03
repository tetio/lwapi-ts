
import { Response } from "express";

export class ApiHandler {
    static INTERNAL_SERVER_ERROR: number = 500;
    static NOT_FOUND: number = 404;
    static OK: number = 200;


    protected static handleResult(res: Response, error: string, result: any | any[]) {
        if (error) {
            return res
                .status(ApiHandler.INTERNAL_SERVER_ERROR)
                .json({ error: error });
        }
        if (result == null) {
            return res
                .status(ApiHandler.NOT_FOUND)
                .json({});
        }
        res.status(ApiHandler.OK).json(result);
    }

}