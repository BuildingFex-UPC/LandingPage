<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import Button from 'primevue/button'
import LocaleSwitcher from './LocaleSwitcher.vue'
import { MarketingRouteNames } from '@/marketing/domain/marketingRoutes.js'
import { webAppUrl } from '@/marketing/infrastructure/envConfig.js'

const webAppLoginUrl = webAppUrl('/login')

const { t } = useI18n()
const route = useRoute()

const SCROLL_SOLID_THRESHOLD = 16

const scrollY = ref(0)
const isMobileMenuOpen = ref(false)

const isHeaderTransparent = computed(() => {
  if (isMobileMenuOpen.value) return false
  const onHome =
    route.name === MarketingRouteNames.HOME || route.path === '/' || route.path === ''
  return onHome && scrollY.value <= SCROLL_SOLID_THRESHOLD
})

function updateScroll() {
  scrollY.value = window.scrollY || 0
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  },
)

watch(isMobileMenuOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const nav = computed(() => [
  { hash: '#inicio', label: t('nav.home') },
  { hash: '#subscriptions', label: t('nav.subscriptions') },
  { hash: '#beneficios', label: t('nav.benefits') },
  { hash: '#contacto', label: t('nav.contact') },
])

function navLinkIsActive(hash) {
  if (route.name !== MarketingRouteNames.HOME) return false
  if (hash === '#inicio') return route.hash === '' || route.hash === '#inicio'
  return route.hash === hash
}
</script>

<template>
  <header
    class="header"
    :class="{
      'header--transparent': isHeaderTransparent,
      'header--open': isMobileMenuOpen,
    }"
    role="banner"
  >
    <div class="header__wrap">
      <div class="header__bar">
        <router-link
          class="brand"
          :to="{ name: MarketingRouteNames.HOME }"
          @click="closeMobileMenu"
        >
          <img
            src="/logo-buildingfex.png"
            :alt="t('brand')"
            class="brand__img"
            width="148"
            height="32"
            decoding="async"
          />
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="nav nav--desktop" :aria-label="t('header.navAria')">
          <router-link
            v-for="item in nav"
            :key="item.hash"
            class="nav__link"
            :class="{ 'nav__link--active': navLinkIsActive(item.hash) }"
            :to="{ name: MarketingRouteNames.HOME, hash: item.hash }"
            :aria-current="navLinkIsActive(item.hash) ? 'page' : undefined"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Right actions -->
        <div class="header__actions">
          <LocaleSwitcher class="locale" />
          <Button
            as="a"
            :href="webAppLoginUrl"
            :label="t('header.start')"
            outlined
            rounded
            severity="secondary"
            size="small"
            class="header-cta header-cta--desktop"
          />
          <button
            type="button"
            class="header__toggle"
            :class="{ 'header__toggle--open': isMobileMenuOpen }"
            :aria-expanded="isMobileMenuOpen"
            :aria-label="isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')"
            @click="toggleMobileMenu"
          >
            <span class="header__toggle-bar header__toggle-bar--1" />
            <span class="header__toggle-bar header__toggle-bar--2" />
            <span class="header__toggle-bar header__toggle-bar--3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <transition name="drawer-fade">
      <div
        v-if="isMobileMenuOpen"
        class="mobile-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('header.navAria')"
      >
        <div class="mobile-drawer__backdrop" @click="closeMobileMenu" />
        <div class="mobile-drawer__panel">
          <nav class="mobile-nav" :aria-label="t('header.navAria')">
            <router-link
              v-for="item in nav"
              :key="item.hash"
              class="mobile-nav__link"
              :class="{ 'mobile-nav__link--active': navLinkIsActive(item.hash) }"
              :to="{ name: MarketingRouteNames.HOME, hash: item.hash }"
              @click="closeMobileMenu"
            >
              <span class="mobile-nav__label">{{ item.label }}</span>
              <i class="pi pi-angle-right mobile-nav__icon" aria-hidden="true" />
            </router-link>
          </nav>
          <div class="mobile-drawer__footer">
            <Button
              as="a"
              :href="webAppLoginUrl"
              :label="t('header.start')"
              icon="pi pi-arrow-right"
              iconPos="right"
              rounded
              severity="info"
              class="mobile-drawer__cta"
              @click="closeMobileMenu"
            />
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  width: 100%;
  padding: 0;
  font-family: var(--apple-font);
  font-size: var(--apple-header-nav-size);
  font-weight: var(--apple-header-nav-weight);
  letter-spacing: var(--apple-header-nav-tracking);
  line-height: var(--apple-header-nav-leading);
  color: var(--apple-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition:
    color 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
    background 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.header--transparent {
  color: rgba(255, 255, 255, 0.92);
}

.header__wrap {
  width: 100%;
  max-width: none;
  margin: 0;
  background: transparent;
}

.header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: var(--landing-header-height, 3.75rem);
  width: 100%;
  padding: 0.5rem max(1rem, env(safe-area-inset-right)) 0.5rem max(1rem, env(safe-area-inset-left));
  background: var(--apple-bg);
  border-bottom: 1px solid var(--apple-border);
  box-shadow: var(--apple-shadow-sm);
  transition:
    background 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
    border-color 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.header--transparent .header__bar {
  background: transparent !important;
  border-bottom: 1px solid transparent !important;
  box-shadow: none !important;
}

.header--open .header__bar {
  background: #ffffff !important;
  border-bottom: 1px solid var(--apple-border) !important;
  box-shadow: var(--apple-shadow-sm) !important;
  color: var(--apple-text) !important;
}

.brand {
  display: flex;
  align-items: center;
  line-height: 0;
  border-radius: 6px;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.brand:hover {
  opacity: 0.72;
}

.brand:focus-visible {
  outline: var(--apple-focus-ring);
  outline-offset: var(--apple-focus-ring-offset);
}

.brand__img {
  height: 26px;
  width: auto;
  max-width: min(138px, 40vw);
  object-fit: contain;
  object-position: left center;
}

.header--transparent:not(.header--open) .brand {
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* Desktop Navigation */
.nav--desktop {
  display: none;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  margin-right: 1rem;
}

.nav__link {
  color: var(--apple-text-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: var(--apple-radius-pill);
  line-height: var(--apple-header-nav-leading);
  font-size: 13px;
  font-weight: 500;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.header--transparent:not(.header--open) .nav__link {
  color: rgba(255, 255, 255, 0.82);
}

.nav__link:hover {
  color: var(--apple-text);
  background: rgba(0, 0, 0, 0.04);
}

.header--transparent:not(.header--open) .nav__link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.nav__link:focus-visible {
  outline: var(--apple-focus-ring);
  outline-offset: var(--apple-focus-ring-offset);
}

.nav__link--active {
  color: var(--apple-text);
  font-weight: 600;
  background: rgba(0, 0, 0, 0.05);
}

.header--transparent:not(.header--open) .nav__link--active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

.nav__link--active:hover {
  background: rgba(0, 0, 0, 0.07);
}

.header--transparent:not(.header--open) .nav__link--active:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Actions */
.header__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.locale {
  flex-shrink: 0;
}

.header-cta--desktop {
  display: none;
  flex-shrink: 0;
}

.header-cta.p-button {
  border-radius: var(--apple-radius-pill) !important;
  overflow: hidden;
  font-family: var(--apple-font) !important;
  font-weight: var(--apple-header-cta-weight) !important;
  font-size: var(--apple-header-cta-size) !important;
  letter-spacing: var(--apple-header-nav-tracking) !important;
  line-height: var(--apple-header-nav-leading) !important;
  padding: 0.45rem 1.15rem !important;
  min-height: 2rem;
  border-color: var(--apple-border-hairline) !important;
  color: var(--apple-text) !important;
  background: rgba(255, 255, 255, 0.94) !important;
  -webkit-font-smoothing: antialiased;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.header-cta.p-button:hover {
  background: #ffffff !important;
  border-color: var(--apple-border-hairline) !important;
  box-shadow: var(--apple-shadow-sm);
}

.header-cta.p-button:focus-visible {
  outline: var(--apple-focus-ring);
  outline-offset: var(--apple-focus-ring-offset);
}

.header--transparent:not(.header--open) .header-cta.p-button.p-button-outlined.p-button-secondary {
  background: transparent !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

.header--transparent:not(.header--open)
  .header-cta.p-button.p-button-outlined.p-button-secondary
  :deep(.p-button-label) {
  color: #ffffff !important;
}

.header--transparent:not(.header--open)
  .header-cta.p-button.p-button-outlined.p-button-secondary:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.75) !important;
  color: #ffffff !important;
}

.header--transparent:not(.header--open) :deep(.locale-switcher) {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.header--transparent:not(.header--open) :deep(.locale-switcher__btn) {
  color: rgba(255, 255, 255, 0.85);
}

.header--transparent:not(.header--open) :deep(.locale-switcher__btn:hover:not(.locale-switcher__btn--active)) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

.header--transparent:not(.header--open) :deep(.locale-switcher__btn--active) {
  color: var(--apple-text);
  background: #ffffff;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.15),
    0 0 0 0.5px rgba(0, 0, 0, 0.08);
}

/* Hamburger button */
.header__toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: inherit;
  transition: background-color 0.2s ease;
}

.header__toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header--transparent:not(.header--open) .header__toggle:hover {
  background: rgba(255, 255, 255, 0.15);
}

.header__toggle:focus-visible {
  outline: var(--apple-focus-ring);
  outline-offset: 2px;
}

.header__toggle-bar {
  display: block;
  width: 20px;
  height: 2px;
  background-color: currentColor;
  border-radius: 2px;
  transition:
    transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1),
    opacity 0.25s ease;
  transform-origin: center;
}

.header--transparent:not(.header--open) .header__toggle-bar {
  background-color: #ffffff;
}

.header--open .header__toggle-bar {
  background-color: var(--apple-text);
}

.header__toggle--open .header__toggle-bar--1 {
  transform: translateY(7px) rotate(45deg);
}

.header__toggle--open .header__toggle-bar--2 {
  opacity: 0;
  transform: scaleX(0);
}

.header__toggle--open .header__toggle-bar--3 {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Drawer */
.mobile-drawer {
  position: fixed;
  top: var(--landing-header-height, 3.75rem);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 49;
  display: flex;
  flex-direction: column;
}

.mobile-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.mobile-drawer__panel {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--apple-border);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  padding: 1rem 1.25rem 1.75rem;
  max-height: calc(100vh - var(--landing-header-height, 3.75rem));
  overflow-y: auto;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--apple-text);
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.mobile-nav__link:hover {
  background: rgba(0, 0, 0, 0.04);
}

.mobile-nav__link--active {
  background: rgba(var(--apple-blue-rgb), 0.08);
  color: var(--apple-blue);
  font-weight: 600;
}

.mobile-nav__icon {
  font-size: 0.875rem;
  color: var(--apple-text-secondary);
}

.mobile-drawer__footer {
  padding-top: 0.75rem;
  border-top: 1px solid var(--apple-border-hairline);
}

.mobile-drawer__cta {
  width: 100%;
  justify-content: center;
  font-size: 16px !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
  background: var(--apple-blue) !important;
  border-color: var(--apple-blue) !important;
  box-shadow: 0 4px 14px rgba(var(--apple-blue-rgb), 0.25);
}

/* Drawer Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-enter-active .mobile-drawer__panel,
.drawer-fade-leave-active .mobile-drawer__panel {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-fade-enter-from .mobile-drawer__panel,
.drawer-fade-leave-to .mobile-drawer__panel {
  transform: translateY(-16px);
}

/* Responsive Media Queries */
@media (min-width: 900px) {
  .nav--desktop {
    display: flex;
  }

  .header-cta--desktop {
    display: inline-flex;
  }

  .header__toggle {
    display: none;
  }

  .brand__img {
    height: 28px;
    max-width: 148px;
  }

  .header__bar {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}
</style>
