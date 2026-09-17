import { Request, Response } from "express";

export const getHome = (req: Request, res: Response) => {
    res.send("TaskFlow"); 
}