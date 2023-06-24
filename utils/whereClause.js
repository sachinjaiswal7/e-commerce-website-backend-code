//base -> Product
// bigQ -> Query with various types of queries 

 class WhereClause {
    constructor(base,bigQ){
        this.base = base
        this.bigQ = bigQ
    }

    //methods of the class
    search(){
        const searchword = (this.bigQ.search ? {
            name : {
                $regex : this.bigQ.search,
                $options : "i",
            },
        }: {}) 
        this.base =   (this.base.find({...searchword}));

        return this
    }

    // method for filtering the products on the basis of greater than and smaller than properties
    filter(){
       const copyOfQ = {...this.bigQ} // this is a shallow copy of the object bigQ
       delete copyOfQ.search
       delete copyOfQ.limit
       delete copyOfQ.page 

        const objString = JSON.stringify(copyOfQ);
        const modifiedString = objString.replace(new RegExp("\\bgte|lte|lt|gt\\b" , 'gi') , s => {
            return `$${s}`;
        })
        
        //converting the string back to the JSON object
        const modifiedObject = JSON.parse(modifiedString);
       this.base =  (this.base.find(modifiedObject));

       return this;
    }

    // method for pagination
     pagination(resultPerPage){
        const pageToFind = (this.bigQ.page || 1);
        let skipFormula = (resultPerPage * (pageToFind - 1))
        this.base =  (this.base.skip(skipFormula).limit(resultPerPage))
        return this;
    }
}


export default WhereClause;