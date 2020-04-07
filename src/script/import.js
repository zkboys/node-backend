import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import {App, AppRelation, Business, BusinessApp, BusinessRelation} from '../entity';

// excel 列对应key关系
const keys = [
    'department', 'suite', 'chargeMan',
    'number', 'type', 'bigSys',
    'sys', 'description', 'relySys',
    'db', 'middleWare', 'diskSpace',
    'memorySize', 'cpuCount', 'ips',
    'remark', 'machineType', 'cost',
    'subBusiness',
];

/**
 * 基于excel文件，生成数据及依赖关系
 * @param filePath excel文件路径
 * @returns {{relations: [], apps: [], businesses: [], businessApps: []}}
 */
export function getAppsAndRelations(filePath) {
    const sheets = xlsx.parse(filePath);
    const result = sheets.find(item => item.name === '设备关系').data;

    const apps = []; // 系统
    const businessArr = []; // 业务线
    let errors = [];

    result.forEach((item, index) => {
        if (index === 0) return;
        const app = {};

        for (let i = 0; i < item.length; i++) {
            let value = item[i];
            const key = keys[i];
            // 处理成本
            if (key === 'cost') value = value ? parseFloat(value) : 0;

            // 处理设备空间 内存大小
            if (key === 'diskSpace' || key === 'memorySize') value = value ? parseFloat(value) : 0;

            // 处理cup个数
            if (key === 'cpuCount') value = value ? parseInt(value) : 0;

            if (typeof value === 'string') value = value.trim();

            app[key] = value;
        }

        if (app.machineType === '业务线') {
            businessArr.push({
                description: app.description,
                department: app.department,
                topBusiness: app.sys,
                subBusiness: app.relySys,
            });
        } else {
            apps.push(app);
        }
    });

    const {businesses, relations: busRelations, errors: busErrors} = getBusiness(businessArr);

    errors = errors.concat(busErrors);

    //  整理数据
    const resultApps = [];
    apps.forEach((item, index) => {
        const {sys} = item;
        if (!sys) return errors.push(`第 ${index + 2} 条记录没有「系统名」已忽略`);

        // 重复数据，进行合并
        const existApp = resultApps.find(it => it.sys === sys);
        if (existApp) {
            ['ips', 'topBusiness', 'subBusiness'].forEach(k => {
                if (item[k]) existApp[k] = existApp[k] ? `${existApp[k]},${item[k]}` : item[k];
            });

            // 设备空间 内存大小 cup数量 成本进行合并
            ['diskSpace', 'memorySize', 'cpuCount', 'cost'].forEach(k => {
                existApp[k] = (existApp[k] || 0) + (item[k] || 0);
            });

            // 依赖系统 依赖数据库 依赖中间件 合并
            ['relySys', 'db', 'middleWare'].forEach(k => {
                if (item[k]) existApp[k] += `\n${item[k]}`;
            });
        } else {
            resultApps.push(item);
        }
    });

    const businessApps = [];
    const busAppErrors = [];

    // 添加id 获取 与业务的依赖关系
    resultApps.forEach((item, index) => {
        const id = index + 1;
        const {sys, subBusiness = '', type} = item;
        item.id = id;

        // 处理业务关系
        if (!subBusiness) {
            if (type === 'app') busAppErrors.push(`系统「${sys}」不归属于任何二级业务，业务关系被忽略`);
            return;
        }

        const subArr = subBusiness.split('\n');

        subArr.forEach(sub => {
            const [subName, weight = 100] = sub.split(',');

            const businessId = businesses.find(it => it.name === subName)?.id;
            if (!businessId) return errors.push(`系统「${sys}」归属的二级业务「${subName}」不存在，业务关系被忽略`);

            // 去重
            if(!businessApps.find(item => item.businessId === businessId &&  item.appId === id)) {
                businessApps.push({
                    businessId,
                    appId: id,
                    weight,
                });
            }
        });
    });

    // 处理系统间依赖关系
    const relations = [];
    const exitErrors = [];
    const nonExitErrors = [];
    resultApps.forEach(item => {
        const {id: sourceId, sys, relySys = '', db = '', middleWare = ''} = item;
        const relySyses = relySys.replace(/[\s,，]/g, '\n').split('\n');
        const dbs = db.replace(/[\s,，]/g, '\n').split('\n');
        const middleWares = middleWare.replace(/[\s,，]/g, '\n').split('\n');

        addRely(relySyses, '系统');
        addRely(dbs, '数据库');
        addRely(middleWares, '中间件');

        function addRely(relies, name) {
            if (relies?.length) {
                relies.forEach(targetSys => {
                    // 依赖不存在
                    if (!targetSys || targetSys === 'undefined') return;

                    const relyApp = resultApps.find(it => it.sys.toLowerCase() === targetSys.toLowerCase());
                    if (!relyApp) return nonExitErrors.push(`系统 「${sys}」依赖${name}「${targetSys}」不存在，依赖关系忽略`);

                    const targetId = relyApp.id;
                    const exist = relations.find(it => it.sourceId === sourceId && it.targetId === targetId);
                    if (exist) return exitErrors.push(`系统 「${sys}」依赖${name}「${targetSys}」已存在，依赖关系忽略`);

                    relations.push({sourceId, targetId});
                });
            }
        }
    });

    // console.log(errors.join('\n'));
    // console.log(nonExitErrors.join('\n'));
    console.log('无法对应依赖数：', nonExitErrors.length);
    console.log('共发现系统：', resultApps.length);
    console.log('共发现依赖关系：', relations.length);

    console.log('系统无法对应业务关系数：', busAppErrors.length);
    console.log('业务数量：', businesses.length);
    console.log('业务关系：', busRelations.length);
    console.log('业务系统关系：', businessApps.length);

    let allErrors = errors.concat(nonExitErrors);
    allErrors = allErrors.concat(busAppErrors);

    allErrors.unshift('业务系统关系：' + businessApps.length);
    allErrors.unshift('业务关系：' + busRelations.length);
    allErrors.unshift('业务数量：' + businesses.length);
    allErrors.unshift('系统无法对应业务关系数：' + busAppErrors.length);
    allErrors.unshift('共发现依赖关系：' + relations.length);
    allErrors.unshift('共发现系统：' + resultApps.length);
    allErrors.unshift('无法对应系统依赖数：' + nonExitErrors.length);


    fs.writeFileSync(path.join(__dirname, 'errors.json'), JSON.stringify(allErrors, null, 4), 'UTF-8');

    return {
        apps: resultApps,
        relations,
        businesses,
        busRelations,
        businessApps,
        errors: allErrors,
    };
}

/**
 * excel内容插入数据库
 * @param apps
 * @param relations
 * @param businesses
 * @param businessApps
 * @param busRelations
 * @param errors
 * @returns {Promise<unknown[]>}
 */
export async function insertInToDB({
                                       apps,
                                       relations,
                                       businesses,
                                       busRelations,
                                       businessApps,
                                       errors,
                                   }) {

    // 先删除所有数据
    for (const Model of [App, AppRelation, Business, BusinessApp, BusinessRelation]) {
        await Model.destroy({
            where: {},
            truncate: true,
        });
    }

    console.time('db');

    // 创建系统
    console.log('系统数据入库');
    await App.bulkCreate(apps);

    // 创建系统间依赖关系
    console.log('系统关系入库');
    await AppRelation.bulkCreate(relations);

    // 创建业务
    console.log('业务数据入库');
    await Business.bulkCreate(businesses);

    // 创建业务间依赖关系
    console.log('业务关系入库');
    await BusinessRelation.bulkCreate(busRelations);

    // 创建业务 与 系统的依赖关系
    console.log('业务与系统关系入库');
    await BusinessApp.bulkCreate(businessApps);

    console.timeEnd('db');

    return errors;
}

function getBusiness(dataSource) {
    const businesses = [];
    const relations = [];
    const errors = [];
    dataSource.forEach((item, index) => {
        const id = index + 1;
        const {
            department,
            topBusiness,
            subBusiness,
            description,
        } = item;

        const subBuses = subBusiness ? subBusiness.split('\n').map(it => {
            const arr = it.split(',');
            return {
                name: arr[0],
                weight: parseInt(arr[1]),
                weightDescription: arr[2],
            };
        }) : [];


        businesses.push({
            id,
            department,
            name: topBusiness,
            description,
            subBusiness: subBuses,
        });
    });

    // 处理关系
    businesses.forEach(item => {
        const {id: topId, subBusiness} = item;

        if (subBusiness?.length) {
            subBusiness.forEach(({name: subName, weight, weightDescription}) => {
                const subId = businesses.find(i => i.name === subName)?.id;
                if (!subId) return errors.push(`子业务「${subName}」无对应的顶级业务，业务关系被忽略`);

                relations.push({
                    topId,
                    subId,
                    weight,
                    weightDescription,
                });
            });
        }
    });
    return {businesses, relations, errors};
}


//
// const filePath = `${__dirname}/20200320-v1.xlsx`;
// const result = getAppsAndRelations(filePath);
// insertInToDB(result);
