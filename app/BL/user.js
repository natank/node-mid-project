import * as User from '../models/User'

export async function getUsers(req, res, next){
    var users = await User.getUsers()
    res.render('./users',{users})
}

export function getUser(req, res, next){
    res.render('/user',{})
}

export function getCreateUser(req, res, next){
    res.render('users/userForm')
}

export function getUpdateUser(req, res, next){
    res.render('users/userForm')
}

export function deleteUser(req, res, next){
    res.render('/')
}

export async function postCreateUser(req, res, next){
    var {username, transactions, password} = req.body;
    await User.createUser({username, transactions, password})
    res.redirect('/users')
}

export async function postUpdateUser(req, res, next){
    res.render('users/userForm')
}