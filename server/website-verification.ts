import axios from 'axios';

export interface VerificationResult {
  isValid: boolean;
  code?: string;
  message: string;
  siteUrl?: string;
  technologies?: string[];
}

export class WebsiteVerificationService {
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private cache: Map<string, { data: VerificationResult; timestamp: number }> = new Map();

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: VerificationResult): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async verifyWebsiteOwnership(url: string, verificationCode: string): Promise<VerificationResult> {
    const cacheKey = `${url}-${verificationCode}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url);
      
      // Auto-approve localhost for development/testing
      const urlObj = new URL(normalizedUrl);
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname === '0.0.0.0') {
        const result: VerificationResult = {
          isValid: true,
          code: verificationCode,
          message: '✅ Localhost auto-approved for development.',
          siteUrl: normalizedUrl,
          technologies: ['Node.js', 'Express', 'React', 'TypeScript']
        };
        this.setCache(cacheKey, result);
        return result;
      }
      
      // Fetch website content
      const response = await axios.get(normalizedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'SecOps-Global-Verifier/1.0'
        },
        maxRedirects: 5
      });

      const html = response.data;
      
      // Check for verification code in various locations
      const isVerified = this.checkVerificationCode(html, verificationCode);
      
      // Extract technologies if verification successful
      const technologies = isVerified ? await this.detectTechnologies(html, normalizedUrl) : [];
      
      const result: VerificationResult = {
        isValid: isVerified,
        code: verificationCode,
        message: isVerified 
          ? 'Website ownership verified successfully! Verification code found on the page.'
          : 'Verification code not found. Please ensure you have placed the verification meta tag on your homepage.',
        siteUrl: normalizedUrl,
        technologies
      };

      this.setCache(cacheKey, result);
      return result;
      
    } catch (error) {
      let message = 'Website verification failed.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          message = 'Website is not accessible. Please check that the site is working and accessible from the internet.';
        } else if (error.response?.status === 404) {
          message = 'Website not found (404). Please check the URL and try again.';
        } else if (error.response && error.response.status >= 500) {
          message = 'Server error on the website. Please try again later.';
        } else if (error.code === 'TIMEOUT') {
          message = 'Website verification timed out. The site may be slow to respond.';
        }
      }

      const result: VerificationResult = {
        isValid: false,
        code: verificationCode,
        message,
        siteUrl: url
      };

      this.setCache(cacheKey, result);
      return result;
    }
  }

  private normalizeUrl(url: string): string {
    url = url.trim();
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  private checkVerificationCode(html: string, verificationCode: string): boolean {
    // Check for meta tag
    const metaRegex = new RegExp(`<meta[^>]+name=["']secops-verification["'][^>]+content=["']${verificationCode}["']`, 'i');
    if (metaRegex.test(html)) {
      return true;
    }

    // Check for JavaScript variable
    const jsRegex = new RegExp(`window\\.SECOPS_VERIFICATION\\s*=\\s*["']${verificationCode}["']`, 'i');
    if (jsRegex.test(html)) {
      return true;
    }

    // Check for comment
    const commentRegex = new RegExp(`<!--.*SecOps Verification Code.*${verificationCode}.*-->`, 'i');
    if (commentRegex.test(html)) {
      return true;
    }

    return false;
  }

  private async detectTechnologies(html: string, url: string): Promise<string[]> {
    const technologies: string[] = [];
    const urlObj = new URL(url);

    // Detect from HTML content
    const htmlLower = html.toLowerCase();

    // Framework detection
    if (htmlLower.includes('react') || htmlLower.includes('reactdom')) {
      technologies.push('React');
    }
    if (htmlLower.includes('vue.js') || htmlLower.includes('vue.min.js')) {
      technologies.push('Vue.js');
    }
    if (htmlLower.includes('angular')) {
      technologies.push('Angular');
    }
    if (htmlLower.includes('jquery')) {
      technologies.push('jQuery');
    }

    // CMS detection
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) {
      technologies.push('WordPress');
    }
    if (htmlLower.includes('drupal')) {
      technologies.push('Drupal');
    }
    if (htmlLower.includes('joomla')) {
      technologies.push('Joomla');
    }

    // Server detection from headers (would need to make additional requests)
    // For now, detect from common patterns
    if (htmlLower.includes('x-powered-by: express')) {
      technologies.push('Express.js');
    }
    if (htmlLower.includes('next.js') || htmlLower.includes('_next')) {
      technologies.push('Next.js');
    }

    // Database detection (indirect)
    if (htmlLower.includes('mysql') || htmlLower.includes('mysqli')) {
      technologies.push('MySQL');
    }
    if (htmlLower.includes('postgresql') || htmlLower.includes('postgres')) {
      technologies.push('PostgreSQL');
    }
    if (htmlLower.includes('mongodb')) {
      technologies.push('MongoDB');
    }

    // Web server detection
    if (htmlLower.includes('nginx')) {
      technologies.push('Nginx');
    }
    if (htmlLower.includes('apache')) {
      technologies.push('Apache');
    }

    // Remove duplicates and limit to 8 technologies
    return [...new Set(technologies)].slice(0, 8);
  }

  generateVerificationCode(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `sec-ver-${timestamp}-${random}`;
  }

  getVerificationInstructions(verificationCode: string) {
    return {
      html: `<!-- SecOps Verification Code -->\n<meta name="secops-verification" content="${verificationCode}" />`,
      text: `Place the following meta tag in the <head> section of your homepage:\n<meta name="secops-verification" content="${verificationCode}" />`,
      alternative: `Or add to the <head> section:\n<script>\nwindow.SECOPS_VERIFICATION = "${verificationCode}";\n</script>`
    };
  }
}

export const websiteVerificationService = new WebsiteVerificationService();
