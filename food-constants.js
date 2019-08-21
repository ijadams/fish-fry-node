module.exports = Object.freeze({
    foodLexicon: ['shrimp', 'fried', 'fries', 'bread', 'plate', 'cheese', 'salad', 'presale', 'potato', 'beans', 'corn', 'coleslaw', 'drinks', 'gumbo', 'crab', 'oyster', 'potatoes', 'macaroni', 'seafood', 'crawfish', 'pizza', 'stew', 'poboys', 'po boys', 'po boy', 'desserts', 'cake', 'dessert', 'eggplant', 'casserole', 'taco', 'tacos', 'greens', 'beans and rice', 'red beans', 'french bread', 'beer', 'cornbread', 'hush puppies', 'hushpuppies', 'jambalaya', 'shrimp creole', 'pie', 'cornbread', 'crawfish boulettes', 'broiled fish', 'redfish', 'boudin balls', 'pudding', 'blueberry', 'étouffée', 'bisque', 'oysters', 'muffuletta', 'soup'],
    url: 'https://www.nola.com/news/communities/crescent_city/article_a316d1b2-5bfb-55a0-90a6-bcb69c27de7d.html',
    getFood: (str, lexicon) => {
        const res = [];
        lexicon.forEach(food => {
            if (str.includes(food))
                res.push(food)
        });
        return res;
    }
});
