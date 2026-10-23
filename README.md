# Accept a Payment with Elements and the Checkout Sessions API

## Set Price ID

In the server code, replace `{{PRICE_ID}}` with the Price ID (`price_xxx`) of the product you created in the quickstart guide. Find it in your [Stripe test Dashboard under Products](https://dashboard.stripe.com/test/products).

## Running the sample

1. Build the server

~~~
dotnet restore
~~~

2. Run the server

~~~
dotnet run
~~~

3. Build the client app

~~~
npm install
~~~

4. Run the client app

~~~
npm start
~~~

5. Go to [http://localhost:3000/checkout](http://localhost:3000/checkout)