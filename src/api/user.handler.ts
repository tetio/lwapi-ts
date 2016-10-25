import { Request, Response, Router } from "express";
import { User } from './user.model';
import { IUser } from './user';
import { Dictionary } from './dictionary';
import * as Chance from "chance";


export class Users {

    public post(req: Request, res: Response, next?: Function) {
        var chance = new Chance();
        var user = new User();
        user.name = chance.first();
        user.lastName = chance.last();
        user.username = user.name.charAt(0).toLowerCase() + user.lastName.toLowerCase();
        user.password = chance.apple_token();
        user.email = user.username + "@gmail.com";
        user.save((err: any, userDb: IUser) => {
            if (err) {
                return next(err);
            }
            res.status(200).send(userDb);    
        });
        
    }

    public put(req: Request, res: Response, next?: Function) {
        var user = new User(req.body);
        let result = user.save();
        res.send(200, result);
    }

    public get(req: Request, res: Response, next?: Function) {        
        User.find({}, (err: any, users: IUser[]) => {
            if (err){
                return next(err);
            }
            if (!users){
                res.status(201).send({"error":"Not found"});    
            }
            res.status(200).json(users);
        });
    }

    public getUser(req: Request, res: Response, next?: Function) {
        let id: string = req.params.id;
        console.log(`1 id = ${id}`);
        User.findById(id, (err: any, user: IUser) => {
            if (err){
                return next(err);
            }
            if (!user){
                res.status(201).send({"error":"Not found"});    
            }
            res.status(200).json(user);
        });
    }

    public filter(req:Request, res: Response, next?: Function) {
        let criteria = req.body;
        var queryCriteria = new Dictionary<String>();
        if (criteria.username !== undefined) {
            queryCriteria["username"] = criteria.username; 
        }
        if (criteria.name !== undefined) {
            queryCriteria["name"] = criteria.name; 
        }
        if (criteria.lastName !== undefined) {
            queryCriteria["lastName"] = criteria.lastName; 
        }
        User.find(queryCriteria).limit(10).exec((err: any, users: IUser[]) => {
            if (err){
                return next(err);
            }
            if (!users){
                res.status(201).send({"error":"Not found"});    
            }
            res.status(200).json(users);            
        });
    }
}


