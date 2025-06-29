'use client';

import styles from "./page.module.css";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image
            src="/pennywise-logo.svg"
            alt="Pennywise Logo"
            width={36}
            height={36}
            className={styles.logoImg}
            priority
          />
          <div>
            <h1>Pennywise</h1>
            <span>Smart Expense Tracking</span>
          </div>
        </div>
        <nav className={styles.nav}>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          {user ? (
            <>
              <span className={styles.userInfo}>
                Welcome, {user.full_name || user.email}
              </span>
              <button onClick={logout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className={styles.loginBtn}>
                Login
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h2>Take Control of Your Finances</h2>
            <p>
              Track expenses, manage budgets, and achieve your financial goals with 
              our intuitive expense tracking application.
            </p>
            <div className={styles.heroButtons}>
              {user ? (
                <Link href="/dashboard" className={styles.primaryBtn}>
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/auth" className={styles.primaryBtn}>
                  Get Started Free
                </Link>
              )}
              <button className={styles.secondaryBtn}>Learn More</button>
            </div>

            <div className={styles.featureHighlights}>
              <div className={styles.featureHighlight}>
                <span className={styles.featureIconLarge}>💡</span>
                <div>
                  <div className={styles.featureTitle}>Smart Insights</div>
                  <div className={styles.featureDesc}>Get personalized spending analytics and tips.</div>
                </div>
              </div>
              <div className={styles.featureHighlight}>
                <span className={styles.featureIconLarge}>🔒</span>
                <div>
                  <div className={styles.featureTitle}>Secure & Private</div>
                  <div className={styles.featureDesc}>Your data is encrypted and never shared.</div>
                </div>
              </div>
              <div className={styles.featureHighlight}>
                <span className={styles.featureIconLarge}>📱</span>
                <div>
                  <div className={styles.featureTitle}>Mobile Friendly</div>
                  <div className={styles.featureDesc}>Access your dashboard anywhere, anytime.</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.dashboardPreview}>
              <div className={styles.dashboardHeader}>
                <h4>Dashboard</h4>
                <span className={styles.date}>December 2024</span>
              </div>
              
              <div className={styles.dashboardContent}>
                <div className={styles.statsRow}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Spent</div>
                    <div className={styles.statValue}>₹2,847</div>
                    <div className={styles.statChange}>+12% vs last month</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Budget Left</div>
                    <div className={styles.statValue}>₹1,153</div>
                    <div className={styles.statChange}>32% remaining</div>
                  </div>
                </div>
                
                <div className={styles.chartSection}>
                  <div className={styles.chartTitle}>Spending by Category</div>
                  <div className={styles.chartBars}>
                    <div className={styles.chartBar}>
                      <div className={styles.barLabel}>Food</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{width: '35%', backgroundColor: '#4CAF50'}}></div>
                      </div>
                      <div className={styles.barValue}>₹995</div>
                    </div>
                    <div className={styles.chartBar}>
                      <div className={styles.barLabel}>Transport</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{width: '25%', backgroundColor: '#2196F3'}}></div>
                      </div>
                      <div className={styles.barValue}>₹712</div>
                    </div>
                    <div className={styles.chartBar}>
                      <div className={styles.barLabel}>Shopping</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{width: '20%', backgroundColor: '#FF9800'}}></div>
                      </div>
                      <div className={styles.barValue}>₹569</div>
                    </div>
                    <div className={styles.chartBar}>
                      <div className={styles.barLabel}>Entertainment</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{width: '15%', backgroundColor: '#9C27B0'}}></div>
                      </div>
                      <div className={styles.barValue}>₹427</div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.recentTransactions}>
                  <div className={styles.sectionTitle}>Recent Transactions</div>
                  <div className={styles.transactionList}>
                    <div className={styles.transaction}>
                      <div className={styles.transactionIcon}>🍕</div>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionName}>Pizza Delivery</div>
                        <div className={styles.transactionCategory}>Food & Dining</div>
                      </div>
                      <div className={styles.transactionAmount}>-₹24.50</div>
                    </div>
                    <div className={styles.transaction}>
                      <div className={styles.transactionIcon}>⛽</div>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionName}>Gas Station</div>
                        <div className={styles.transactionCategory}>Transportation</div>
                      </div>
                      <div className={styles.transactionAmount}>-₹45.00</div>
                    </div>
                    <div className={styles.transaction}>
                      <div className={styles.transactionIcon}>🛒</div>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionName}>Grocery Store</div>
                        <div className={styles.transactionCategory}>Shopping</div>
                      </div>
                      <div className={styles.transactionAmount}>-₹87.30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h3>Key Features</h3>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💰</div>
              <h4>Expense Tracking</h4>
              <p>Easily log and categorize your daily expenses</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📈</div>
              <h4>Budget Management</h4>
              <p>Set budgets and track your spending patterns</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h4>Group Expenses</h4>
              <p>Split bills and track shared expenses with friends</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h4>Mobile Friendly</h4>
              <p>Access your finances anywhere, anytime</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Pennywise</h4>
            <p>Smart expense tracking for everyone</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#api">API</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#careers">Careers</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 Pennywise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
