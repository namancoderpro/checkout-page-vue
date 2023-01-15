<script>
import { onMounted, ref } from 'vue';
export default {
    name: 'App',
    setup() {
        let stripe; //for calling stripe in our client-side
        let loading = ref(true); //a variable to show loading to user
        let elements; //accessing stripe elements
        let success = false;

        onMounted(async () => {
            const ELEMENT_TYPE = "card"
            stripe = Stripe(import.meta.env.VITE_STRIPE_KEY);
            elements = stripe.elements();
            const element = elements.create(ELEMENT_TYPE);
            element.mount('#stripe-element-mount-point');

            loading.value = false;
        });

        async function handleSubmit(event) {
            if (loading.value) return;
            loading.value = true;

            const { fullName, email, address, city, state, zip } = Object.fromEntries(new FormData(event.target));

            const billingDetails = {
                name: fullName,
                email,
                address: {
                    city,
                    line1: address,
                    state,
                    postal_code: zip
                }
            };

            const cardElement = elements.getElement("card");

            try {
                const response = await fetch("http://localhost:4000/stripe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ amount: 1999, name: fullName, line1: address, postal_code: zip, city: city, state: state, country: "US" })
                })
                const { secret } = await response.json();
                console.log("secret", secret)

                const { error } = await stripe.confirmCardPayment(secret, {
                    payment_method: {
                        type: "card",
                        card: cardElement,
                        billing_details: billingDetails,
                    },
                });


                if (error) {
                    console.log(error);
                    return
                };

                loading.value = false;
                success = true;

            } catch (error) { }
        }

        return { handleSubmit, loading }
    },

}
</script>

<template>
    <div class="flex h-screen align-middle">
        <div class="w-1/2 h-full text-black font-sans bg-zinc-100 py-16 px-36">
            <!--Product details on left side of page-->
            <div class="flex flex-row justify-between">
                <h2 class="text-2xl font-semibold">Minimal Icons</h2>
                <h2 class="text-xl">$19.00</h2>
            </div>
            <img src="/icon-pack.png" alt="" class="w-72 h-64 my-10 mx-auto">
            <p>A set of minimal icons that can be used commercially as well. Specifically built with accessibility and
                elegance in mind.</p>
        </div>


        <div class="font-sans text-black w-1/2 py-16 px-36"> <!--Checkout form on left side of page-->
            <h2 class="text-2xl font-semibold">Payment Details</h2>
            <p>Complete your purchase by filling in the details.</p>
            <form class="mt-2" @submit.prevent="handleSubmit">
                <label for="email" class="text-md font-sans">Email Address</label>
                <input type="email" name="email" placeholder="example@example.com"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label for="fullName" class="text-md font-sans">Full Name</label>
                <input type="text" name="fullName" placeholder="John Doe"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label for="address" class="text-md font-sans">Address</label>
                <input type="text" name="address" placeholder="1234 My Street"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label for="city" class="text-md font-sans">City</label>
                <input type="text" name="city" placeholder="San Diego"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label for="state" class="text-md font-sans">State</label>
                <input type="text" name="state" placeholder="California"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label for="zip" class="text-md font-sans">Zip</label>
                <input type="text" name="zip" placeholder="John Doe"
                    class="mb-2 shadow-sm border-2 p-1 w-full rounded-md focus:outline-purple-800">

                <label class="relative w-full flex flex-col mb-2">
                    <span class="">Card number</span>
                    <div class="rounded-md peer px-2 py-2 border-2 border-gray-200 placeholder-gray-300 focus:outline-purple-800 input"
                        id="stripe-element-mount-point"></div>
                </label>


                <button type="submit" class="bg-purple-800 p-3 text-white rounded-lg my-4" :class="{ dis: loading }">{{
                    loading? "Loading...": "Pay Now"
                }}</button>

                <p class="text-medium text-lg">{{success ? "Success, payment done!" : ""}}</p>

            </form>

            <p class="font-semibold text-xl">OR...</p>

            <form action="http://localhost:4000/create-checkout-session" method="POST">
                <!--Button that redirects to Stripe's page-->
                <button type="submit" class="bg-purple-800 p-3 text-white rounded-lg my-4">Pay With Stripe</button>
            </form>
        </div>
    </div>
</template>