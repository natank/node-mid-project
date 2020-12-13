import express from 'express'
import User from '../models/User'

export function getUsers(req, res, next){
    res.render('./users/users',{})
}

export function getUser(req, res, next){
    res.render('/users/user',{})
}

export function getCreateUser(req, res, next){
    res.render('users/userForm')
}

export function getUpdateUser(req, res, next){
    res.render('users/userForm', {})
}

export function deleteUser(req, res, next){
    res.render('/')
}

export function postCreateUser(req, res, next){
    res.render('/')
}

export function updateUser(req, res, next){
    res.render('/')
}

