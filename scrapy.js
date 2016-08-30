/**
 * Created by Administrator on 2016/8/28.
 *
 */
'use strict'
var syncReuest = require('sync-request');
var MongoClent = require('mongodb').MongoClient;
var redis = require('redis'),
    client = redis.createClient(6379,'192.168.100.2',{]});
client.on('connect',function () {
    console.log('connect redis [%s:%s] success!',config.redis.host,config.redis.port);
})

var request = require('request');
var wxConfig ={
    appID : 'wx3c1e9fdd84a88826',
    appsecret : '73544f42698c7564deeff273e9ae0091',
}
/*var userlistUrl = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token='+wxConfig.token+'&next_openid=o0-ygs5xem_bFNcboIJZUutRYsHI';
MongoClent.connect('mongodb://192.168.100.2:27017/wechatUser',function (err,db) {
    request(userlistUrl,function (err,res,body) {
        var list = JSON.parse(body);
        var data = list.data;
        var next_openid = list.next_openid;
        var userlist = {
            lastid : next_openid,
            data : data
        }
        insert(db,userlist,function () {
            console.log('insert one');
        })
    })
})*/
var insert = function (db,docs,cb) {
    db.collection('userInfo').insertOne(docs,function (err,result) {
        cb();
    })
}
function get(key) {
    return function (cb) {
        client.get(key,cb);
    }
}
function set(key,value) {
    return function (cb) {
        client.set(key,value,cb)
    }
}
function expire(key,time ) {
    return function (cb) {
        client.expire(key,time,cb);
    }
}
MongoClent.connect('mongodb://192.168.100.2:27017/wechatUser',function (err,db) {
    /*var token = yield get("scrapy_token");
    if (token == null){
        var tresult = syncReuest('GET','https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+config.appID+'&secret='+config.appsecret);
        var result = JSON.parse(tresult.getBody().toString());
        token = result.access_token;
        yield set('scrapy_token',token);
        yield expire('scrapy_token',7000);
    }*/
    var cursor = db.collection('usrlist').find();
    cursor.each(function (err,doc) {
        if(doc != null){
            var data = doc.data.openid;
            for (let i = 0;i<data.length;i++){
                db.collection('openid').insertOne({openid:data[i]},function (err,result) {
                    console.log('insert one');
                })
            }
        }
    })
})
var getuserInfo = function (openid,cb) {
    request('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+wxConfig.token+'&openid='+openid,function (err,res,body) {
        var doc = JSON.parse(body);
        doc['createtime'] = new Date();
        cb();
    })
}
