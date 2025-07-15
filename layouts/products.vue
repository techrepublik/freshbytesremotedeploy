<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Sidebar (if you have one) -->
    <Sidebar />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Product-specific navigation -->
      <ProductNavigation />
      
      <!-- Page Content -->
      <main class="px-6 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>