let str = "My bmy is sachin , My name is sachin My name is sachin"
str = str.replace(new RegExp("\\bbmy|name\\b","ig",) , (s) => {
    return `$${s}`
})
console.log(str)


const obj = {
    name : "sachin jaiswal",
    height : 22.5,
    number : 44
}

delete obj.name
delete obj.fifty
delete obj.ninety

console.log(obj);