const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 6;
    await instance.createStar('awesome star', starId, {from: user1});
    // validate name
    const name = await instance.name({from: user1});
    assert.equal("Star Token", name);
    // validate symbol
    const symbol = await instance.symbol({from: user1});
    assert.equal("STAR", symbol);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    // create stars for users
    const user1 = accounts[1];
    const star1Id = 7;
    await instance.createStar('awesome star', star1Id, {from: user1});
    const user2 = accounts[2];
    const star2Id = 8;
    await instance.createStar('awesome star', star2Id, {from: user2});
    //exchange them
    await instance.exchangeStars(star1Id, star2Id, {from: user1});
    // validate ownership of star1 has changed
    const owner1 = await instance.ownerOf(star1Id, {from: user1});
    assert.equal(user2, owner1);
    // validate ownership of star2 has changed
    const owner2 = await instance.ownerOf(star2Id, {from: user1});
    assert.equal(user1, owner2);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 9;
    await instance.createStar('awesome star', starId, {from: user1});
    // transfer star to user2
    await instance.transferStar(user2, starId, {from: user1});
    // validate ownership of star has changed
    const owner = await instance.ownerOf(starId, {from: user1});
    assert.equal(user2, owner)
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 10;
    const name = 'awesome star';
    await instance.createStar(name, starId, {from: user1});
    // validate info
    const info = await instance.lookUptokenIdToStarInfo(starId, {from: user1});
    assert.equal(name, info);
});