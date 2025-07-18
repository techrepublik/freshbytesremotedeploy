<template>
<!-- Footer -->
  <footer
      class="mt-auto border-t border-gray-200 dark:border-gray-700 py-4 flex flex-col md:flex-row items-center justify-between px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
      <div class="flex items-center space-x-4">
          <span>© 2025 FreshBytes. All rights reserved.</span>
          <a href="#" class="hover:underline">Privacy Policy</a>
          <a href="#" class="hover:underline">API</a>
          <a href="#" class="hover:underline">Contact</a>
      </div>

      <div class="flex items-center space-x-2 mt-2 md:mt-0">
          <select class="text-sm bg-transparent focus:outline-none dark:text-white">
              <option selected>English (US)</option>
              <!-- Add more language options -->
          </select>
          <button class="text-gray-500 dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v16m8-8H4" />
              </svg>
          </button>
      </div>
  </footer>
</template>