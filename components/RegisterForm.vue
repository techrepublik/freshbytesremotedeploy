<template>
    <form class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" @submit.prevent="triggerAction">
        <div>
            <label for="first-name" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                First Name
            </label>
            <input type="text" id="first-name" v-model="form.first_name" required placeholder="Josh"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="last-name" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Last Name
            </label>
            <input type="text" id="last-name" v-model="form.last_name" required placeholder="Lorilla"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="user-name" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Username
            </label>
            <input type="text" id="user-name" v-model="form.user_name" required placeholder="username"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="user-phone" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Phone Number
            </label>
            <input type="tel" id="user-phone" v-model="form.user_phone" required placeholder="09XXXXXXXXX"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="email" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Your Email
            </label>
            <input type="email" id="email" v-model="form.email" required placeholder="email@example.com"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="password" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Password
            </label>
            <input type="password" id="password" v-model="form.password" required
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div>
            <label for="confirm-password" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Confirm Password
            </label>
            <input type="password" id="confirm-password" v-model="form.confirmPassword" required
                class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <!-- Optional: Full-width row at bottom for checkbox -->
        <div class="col-span-full flex items-center mt-4">
            <input id="remember" type="checkbox"
                class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600" />
            <label for="remember" class="ml-2 text-lg text-gray-700 dark:text-gray-300">
                Remember me
            </label>
        </div>

        <!-- Submit button full width -->
        <div class="col-span-full mt-4">
            <button type="submit"
                class="w-full py-3 text-lg text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-semibold rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800 transition">
                {{ isLoading ? 'Submitting...' : 'Submit' }}
            </button>
        </div>
    </form>
    <!-- Register Link -->
    <div class="mt-6 text-base text-center text-gray-700 dark:text-gray-300">
        <span>Already have an account?</span>
        <NuxtLink to="/Login" class="ml-1 text-emerald-700 font-semibold hover:underline">
            Log In
        </NuxtLink>

    </div>
</template>

<script setup>
const props = defineProps({
    form: {
        type: Object,
        required: true,
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['child-action'])

const triggerAction = () => {
    emit('child-action', props.form) // Just emit — let parent handle logic
}
</script>
