
/**
 * export-menu-page-permission.cjs — Tự động export cấu trúc menu & page permission ra JSON
 *
 * Cách dùng:
 *   node .claude/skills/export-menu-page-permission/scripts/export-menu-page-permission.cjs
 *   node .claude/skills/export-menu-page-permission/scripts/export-menu-page-permission.cjs --portal invoice
 *   node .claude/skills/export-menu-page-permission/scripts/export-menu-page-permission.cjs --all
 *   node .claude/skills/export-menu-page-permission/scripts/export-menu-page-permission.cjs --top-menu "Hóa đơn"
 *
 * Node.js >= 18
 */

const fs = require('fs');
const path = require('path');

// ── Đường dẫn workspace root ──────────────────────────────────────────────
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const EXPORTS_DIR = path.join(__dirname, '..', 'export-json');

// ── Định nghĩa Portal (cập nhật theo cấu trúc repo độc lập 07/2026) ───────
// Mỗi portal có module path dạng src/modules/XxxApp/ với TopMenu/NavMenu riêng
// KetoanApp đặc biệt: không có layout/ riêng (quản lý qua route trực tiếp)
const PORTALS = {
  invoice: {
    name: 'Invoice',
    shortName: 'invoice',
    fullName: 'Phần mềm Hóa đơn điện tử',
    appType: 2,
    appTypeName: 'Invoice',
    prefix: 'INV',
    modulePath: 'InvoiceApp',
    topMenuFile: 'src/modules/InvoiceApp/layout/TopMenu.tsx',
    navMenuFile: 'src/modules/InvoiceApp/layout/NavMenu.tsx',
    routeConfigFile: 'src/modules/InvoiceApp/routes/routeConfig.tsx',
    urlBase: '/business',
    featuresDir: 'src/modules/InvoiceApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.Invoice.ts',
  },
  admin: {
    name: 'Admin',
    shortName: 'admin',
    fullName: 'Web portal quản trị hệ thống',
    appType: 1,
    appTypeName: 'Admin',
    prefix: 'ADM',
    modulePath: 'AdminApp',
    topMenuFile: 'src/modules/AdminApp/layout/TopMenuAdmin.tsx',
    navMenuFile: 'src/modules/AdminApp/layout/NavMenuAdmin.tsx',
    routeConfigFile: 'src/modules/AdminApp/routes/routeConfig.tsx',
    urlBase: '/admin',
    featuresDir: 'src/modules/AdminApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.Admin.ts',
  },
  partner: {
    name: 'Partner',
    shortName: 'partner',
    fullName: 'Web portal đối tác',
    appType: 3,
    appTypeName: 'Partner',
    prefix: 'PTN',
    modulePath: 'PartnerApp',
    topMenuFile: 'src/modules/PartnerApp/layout/TopMenuPartner.tsx',
    navMenuFile: 'src/modules/PartnerApp/layout/NavMenuPartner.tsx',
    routeConfigFile: null,
    urlBase: '/partner',
    featuresDir: 'src/modules/PartnerApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.Partner.ts',
  },
  sso: {
    name: 'SSO',
    shortName: 'sso',
    fullName: 'Đăng nhập & Quản lý tài khoản',
    appType: 8,
    appTypeName: 'SSO',
    prefix: 'SSO',
    modulePath: 'SsoApp',
    topMenuFile: null,
    navMenuFile: 'src/modules/SsoApp/layout/NavMenuSso.tsx',
    routeConfigFile: null,
    urlBase: '/sso',
    featuresDir: 'src/modules/SsoApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.SSO.ts',
  },
  ketoan: {
    name: 'Ketoan',
    shortName: 'ketoan',
    fullName: 'Phần mềm Kế toán',
    appType: 4,
    appTypeName: 'Accounting',
    prefix: 'ACC',
    modulePath: 'KetoanApp',
    topMenuFile: null,
    navMenuFile: null,
    routeConfigFile: null,
    urlBase: '/ketoan',
    featuresDir: 'src/modules/KetoanApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.Ketoan.ts',
  },
  kiemthu: {
    name: 'KiemThu',
    shortName: 'kiemthu',
    fullName: 'Phần mềm Test Management',
    appType: 6,
    appTypeName: 'TestManagement',
    prefix: 'TEST',
    modulePath: 'KiemThuApp',
    topMenuFile: 'src/modules/KiemThuApp/layout/TopMenuKiemThu.tsx',
    navMenuFile: 'src/modules/KiemThuApp/layout/NavMenuKiemThu.tsx',
    routeConfigFile: null,
    urlBase: '/kiemthu',
    flatUrl: true,
    featuresDir: 'src/modules/KiemThuApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.KiemThu.ts',
  },
  taisan: {
    name: 'TaiSan',
    shortName: 'taisan',
    fullName: 'Phần mềm Quản lý tài sản',
    appType: 7,
    appTypeName: 'TaiSan',
    prefix: 'TAS',
    modulePath: 'TaiSanApp',
    topMenuFile: 'src/modules/TaiSanApp/layout/TopMenuTaiSanApp.tsx',
    navMenuFile: 'src/modules/TaiSanApp/layout/NavMenuTaiSanApp.tsx',
    routeConfigFile: null,
    urlBase: '/taisan',
    flatUrl: true,
    featuresDir: 'src/modules/TaiSanApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.TaiSan.ts',
  },
  crm: {
    name: 'CRM',
    shortName: 'crm',
    fullName: 'Phần mềm CRM',
    appType: 5,
    appTypeName: 'CRM',
    prefix: 'CRM',
    modulePath: 'CrmApp',
    topMenuFile: 'src/modules/CrmApp/layout/TopMenuCrm.tsx',
    navMenuFile: 'src/modules/CrmApp/layout/NavMenuCrm.tsx',
    routeConfigFile: null,
    urlBase: '/crm',
    flatUrl: true,
    featuresDir: 'src/modules/CrmApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.CRM.ts',
  },
  baseindex: {
    name: 'BaseIndex',
    shortName: 'baseindex',
    fullName: 'Dữ liệu nền',
    appType: 9,
    appTypeName: 'BaseIndex',
    prefix: 'BASE',
    modulePath: 'BaseIndexApp',
    topMenuFile: 'src/modules/BaseIndexApp/layout/TopMenuBaseIndex.tsx',
    navMenuFile: 'src/modules/BaseIndexApp/layout/NavMenuBaseIndex.tsx',
    routeConfigFile: null,
    urlBase: '/base-index',
    featuresDir: 'src/modules/BaseIndexApp/features',
    urlOverrides: {},
    mappingFile: 'PermissionMapping.BaseIndex.ts',
  },
};

// ── Regex / Trích xuất ────────────────────────────────────────────────────

/**
 * Trích xuất mảng MENU_CONFIG / GROUP_TABS / DIRECT_MENUS từ TopMenu file
 * Hỗ trợ nhiều pattern khác nhau giữa các portal
 */
function extractTopMenuConfig(content) {
  // Pattern 1: MENU_CONFIG hoặc TOP_MENU_ITEMS với id/label/icon
  // Pattern 2: GROUP_TABS với key/label/icon (KiemThuApp)
  // Pattern 3: DIRECT_MENUS + DROPDOWN_MENUS (BaseIndexApp)

  // Thử pattern 1 & 2: MENU_CONFIG | TOP_MENU_ITEMS | GROUP_TABS
  const pattern1 = /(?:export\s+)?const\s+(\w*(?:MENU_CONFIG|TOP_MENU_ITEMS|GROUP_TABS)\w*)\s*:?\s*(?:[\w[\]<>,\s]*)?\s*=\s*\[([\s\S]*?)\]\s*\r?\n/;
  const match1 = content.match(pattern1);

  if (match1) {
    const configBody = match1[2];
    const items = [];

    // Thử pattern với id/label/icon
    let itemRegex = /\{\s*(?:id|key):\s*'([^']+)'\s*,\s*(?:label|name):\s*'([^']+)'[^}]*icon:\s*(\w+)/g;
    let match;
    while ((match = itemRegex.exec(configBody)) !== null) {
      items.push({ id: match[1], label: match[2], icon: match[3] });
    }

    if (items.length > 0) return items;

    // Fallback: thử pattern với key/label trước icon
    itemRegex = /\{\s*(?:id|key):\s*'([^']+)'[^}]*icon:\s*(\w+)[^}]*\}/g;
    while ((match = itemRegex.exec(configBody)) !== null) {
      // Tìm label trong cùng object
      const objStart = configBody.lastIndexOf('{', match.index);
      const objEnd = configBody.indexOf('}', match.index) + 1;
      const obj = configBody.substring(objStart, objEnd);
      const labelMatch = obj.match(/(?:label):\s*'([^']+)'/);
      items.push({
        id: match[1],
        label: labelMatch ? labelMatch[1] : match[1],
        icon: match[2],
      });
    }

    return items;
  }

  // Pattern 3: BaseIndexApp — DIRECT_MENUS + DROPDOWN_MENUS
  const directMatch = content.match(/const\s+DIRECT_MENUS\s*:?\s*(?:[\w[\]<>,\s]*)?\s*=\s*\[([\s\S]*?)\]\s*\r?\n/);
  const dropdownMatch = content.match(/const\s+DROPDOWN_MENUS\s*:?\s*(?:[\w[\]<>,\s]*)?\s*=\s*\[([\s\S]*?)\]\s*\r?\n/);

  if (directMatch) {
    const allItems = [];
    const extractItems = (body) => {
      const items = [];
      const itemRegex = /\{\s*id:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'[^}]*icon:\s*(\w+)/g;
      let match;
      while ((match = itemRegex.exec(body)) !== null) {
        items.push({ id: match[1], label: match[2], icon: match[3] });
      }
      return items;
    };

    allItems.push(...extractItems(directMatch[1]));
    if (dropdownMatch) {
      const dropdownItems = extractItems(dropdownMatch[1]);
      // Đánh dấu dropdown items (sẽ xử lý sau)
      dropdownItems.forEach(item => { item._inDropdown = true; });
      allItems.push(...dropdownItems);
    }

    return allItems;
  }

  return [];
}

/**
 * Trích xuất menuItems record từ NavMenu file
 * Pattern: const menuItems: Record<string, NavMenuItem[]> = { ... }
 */
function extractNavMenuItems(content) {
  // Tìm block menuItems / NAV_ITEMS_BY_TOP_MENU / similar patterns
  const menuMatch = content.match(
    /const\s+(\w*(?:menuItems|NAV_ITEMS|navItems)\w*)\s*:?\s*(?:[\w[\]<>,\s]*)?\s*Record<[^>]*>\s*=\s*(\{[\s\S]*?\r?\n\})/
  );
  if (!menuMatch) return {};

  const body = menuMatch[2];

  // Parse từng group (key: string, value: mảng)
  const groups = {};
  // Pattern: 'key' hoặc key: [ ...items... ],
  const groupRegex = /\s*['\"]?(\w[\w-]*)['\"]?\s*:\s*\[([\s\S]*?)\],\s*/g;
  let groupMatch;
  while ((groupMatch = groupRegex.exec(body)) !== null) {
    const groupKey = groupMatch[1];
    const groupBody = groupMatch[2];
    const items = [];

    // Pattern cho từng item: { id: '...', label: '...', icon: <IconName ...> hoặc icon: IconName, ... }
    const itemRegex = /\{\s*id:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'\s*,\s*icon:\s*(?:<([A-Z]\w*)|([A-Z]\w*))/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(groupBody)) !== null) {
      const iconName = itemMatch[3] || itemMatch[4]; // group 3 = JSX, group 4 = identifier
      items.push({
        id: itemMatch[1],
        label: itemMatch[2],
        icon: iconName,
      });
    }
    if (items.length > 0) {
      groups[groupKey] = items;
    }
  }

  return groups;
}

/**
 * Trích xuất URL mappings từ routeConfig file (chỉ Business/Admin)
 * Pattern: { path: '...', pageId: '...', mainMenu: '...' }
 */
function extractUrlMappings(content, urlBase) {
  const mappings = {};

  // Bước 1: Tách từng route object { path: '...', ... }
  // Sử dụng stack để đếm dấu ngoặc {} lồng nhau
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (content[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(content.substring(start, i + 1));
        start = -1;
      }
    }
  }

  // Bước 2: Lọc object có đủ path + pageId + mainMenu
  for (const obj of objects) {
    const pathMatch = obj.match(/path:\s*'([^']+)'/);
    const pageIdMatch = obj.match(/pageId:\s*'([^']+)'/);
    const mainMenuMatch = obj.match(/mainMenu:\s*'([^']+)'/);

    if (pathMatch && pageIdMatch && mainMenuMatch) {
      mappings[pageIdMatch[1]] = `${urlBase}/${pathMatch[1]}`;
    }
  }

  return mappings;
}

// ── Sinh menuCode ──────────────────────────────────────────────────────────

/**
 * Chuyển tiếng Việt → UPPER_SNAKE không dấu
 */
function toUpperSnake(vnName) {
  // Bỏ dấu tiếng Việt
  const noAccent = vnName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[Đ]/g, 'D');

  // Chuyển thành UPPER_SNAKE
  return noAccent
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Sinh menuCode cho top menu
 */
function generateTopMenuCode(prefix, label) {
  return `${prefix}_${toUpperSnake(label)}`;
}

/**
 * Sinh menuCode cho child
 * Quy tắc: nếu có thể → dùng parentCode + childName
 * Nếu quá dài → dùng prefix + childName
 */
function generateChildMenuCode(prefix, parentCode, childLabel) {
  const childPart = toUpperSnake(childLabel);
  const candidate = `${parentCode}_${childPart}`;

  // Ưu tiên dùng parentCode + childName nếu không quá dài
  if (candidate.length <= 60) return candidate;

  // Fallback: dùng prefix + childName
  return `${prefix}_${childPart}`;
}

/**
 * Sinh menuNameEn từ menuName tiếng Việt
 */
function generateEnglishName(vnName) {
  const map = {
    'Dashboard': 'Dashboard',
    'Tổng quan': 'Overview',
    'Tổng Quan': 'Overview',
    'Hóa đơn': 'Invoices',
    'Chứng từ': 'Documents',
    'Báo cáo': 'Reports',
    'Báo Cáo': 'Reports',
    'Danh mục': 'Categories',
    'Danh Mục': 'Categories',
    'Quản lý': 'Management',
    'Quản Lý': 'Management',
    'Cài đặt': 'Settings',
    'Khách hàng': 'Customers',
    'Khách Hàng': 'Customers',
    'Hàng hóa': 'Items',
    'Tài Sản': 'Assets',
    'Mua Sắm': 'Procurement',
    'Vận Hành': 'Operations',
    'Phê Duyệt': 'Approvals',
    'Hệ Thống': 'System',
    'Bàn làm việc': 'Workspace',
    'Bán hàng': 'Sales',
    'Bán Hàng': 'Sales',
    'Chăm sóc': 'Customer Care',
    'Chăm Sóc': 'Customer Care',
    'Marketing': 'Marketing',
    'Tài sản': 'Assets',
    'Đối tác': 'Partners',
    'Nhân sự': 'HR',
    'Dự án': 'Projects',
    'Tài chính': 'Finance',
    'Tổ chức': 'Organization',
    'Kiểm thử': 'Testing',
    'Tài liệu': 'Documents',
    'Phát triển PM': 'Software Dev',
    'Quản lý truy cập': 'Access Control',
    'Giám sát hệ thống': 'System Monitor',
    'Quản lý tài khoản': 'Account Management',
    'Quản trị': 'Administration',
    'Thanh toán': 'Payments',
    'Đối soát': 'Reconciliation',
    'Giám sát': 'Monitoring',
    'Tài khoản': 'Accounts',
    // Children
    'Danh sách hóa đơn': 'Invoice Management',
    'Hóa đơn phát hành': 'Invoice Issuance',
    'Quản lý phê duyệt': 'Invoice Approval',
    'Tờ khai sử dụng hóa đơn': 'Invoice Declaration',
    'Đồng bộ CQT': 'Tax Sync',
    'Chứng từ khấu trừ TNCN': 'PIT Deduction Certificate',
    'Đăng ký tờ khai': 'Document Declaration Registration',
    'Danh mục khách hàng': 'Customer Category',
    'Danh mục hàng hóa': 'Item Category',
    'Báo cáo hóa đơn theo ngày': 'Daily Invoice Report',
    'Báo cáo hóa đơn theo tháng': 'Monthly Invoice Report',
    'Tình trạng sử dụng hóa đơn': 'Invoice Usage Status',
    'Báo cáo sử dụng chứng từ': 'Document Usage Report',
    'Thông tin doanh nghiệp': 'Business Information',
    'Cài đặt chung': 'General Settings',
    'Mẫu hóa đơn': 'Invoice Template',
    'Dịch vụ hóa đơn': 'Invoice Service',
    'Phân quyền vai trò': 'Role Permission',
    'Tích hợp API': 'API Integration',
    'Quản lý chữ ký số': 'Digital Certificates',
    'Quản lý App Client': 'Client Apps',
    'Log tác động người dùng': 'User Activity Logs',
    'Log nghiệp vụ': 'Business Logs',
    'Lịch sử gửi mail': 'Email History',
    'Quản lý tờ khai': 'Declaration Management',
    'Thông điệp cơ quan thuế': 'Tax Authority Messages',
    'Lịch sử tương tác': 'Transaction History',
    'Lịch sử thanh toán': 'Payment History',
    'Lịch sử đăng nhập': 'Login History',
  };
  return map[vnName] || vnName;
}

/**
 * Sinh description từ menuName
 */
function generateDescription(vnName, isTop) {
  if (isTop) {
    const desc = {
      'Dashboard': 'Trang tổng quan hóa đơn điện tử',
      'Hóa đơn': 'Quản lý vòng đời hóa đơn điện tử',
      'Chứng từ': 'Quản lý chứng từ liên quan',
      'Báo cáo': 'Báo cáo tình hình sử dụng hóa đơn và chứng từ',
      'Danh mục': 'Danh mục khách hàng và hàng hóa',
      'Quản lý': 'Cấu hình và quản trị vận hành hóa đơn',
      'Tổng Quan': 'Trang tổng quan hệ thống',
      'Tài Sản': 'Quản lý tài sản doanh nghiệp',
      'Mua Sắm': 'Quản lý mua sắm và đấu thầu',
      'Vận Hành': 'Quản lý vận hành tài sản',
      'Phê Duyệt': 'Quản lý phê duyệt các yêu cầu',
      'Báo Cáo': 'Báo cáo và thống kê',
      'Danh Mục': 'Danh mục dữ liệu nền',
      'Hệ Thống': 'Cấu hình hệ thống',
      'Bàn làm việc': 'Trang bàn làm việc CRM',
      'Khách hàng': 'Quản lý khách hàng tiềm năng',
      'Khách Hàng': 'Quản lý khách hàng',
      'Bán hàng': 'Quản lý cơ hội và quy trình bán hàng',
      'Bán Hàng': 'Quản lý cơ hội và báo giá',
      'Chăm sóc': 'Quản lý hoạt động chăm sóc khách hàng',
      'Chăm Sóc': 'Quản lý hoạt động chăm sóc khách hàng',
      'Marketing': 'Quản lý chiến dịch marketing',
    };
    return desc[vnName] || `Quản lý ${vnName.toLowerCase()}`;
  }
  return `Quản lý ${vnName.toLowerCase()}`;
}

// ── Scan PAGE_FEATURES từ source code ─────────────────────────────────────

/**
 * Quét tất cả page .tsx trong featuresDir, trích xuất PAGE_ID + PAGE_FEATURES
 * Trả về: { mapping: { pageId → features[] }, missing: [{ file, pageId }] }
 *   features[] = [{ label, code }] — từ PAGE_FEATURES metadata
 */
function scanPageFeatures(featuresDir) {
  const fullDir = path.join(WORKSPACE_ROOT, featuresDir);
  const mapping = {};
  const missing = [];

  if (!fs.existsSync(fullDir)) return { mapping, missing };

  /**
   * Đọc PAGE_ID + PAGE_FEATURES từ đầu file .tsx (8KB)
   */
  function extractFromPageFile(pagePath) {
    const fd = fs.openSync(pagePath, 'r');
    const buf = Buffer.alloc(65536);
    const bytesRead = fs.readSync(fd, buf, 0, 65536, 0);
    fs.closeSync(fd);
    const content = buf.toString('utf8', 0, bytesRead);

    const pageIdMatch = content.match(/export\s+const\s+PAGE_ID\s*=\s*['"]([^'"]+)['"]/);
    if (!pageIdMatch) return null;

    const pageId = pageIdMatch[1];
    const featuresMatch = content.match(/export\s+const\s+PAGE_FEATURES\s*=\s*\[([\s\S]*?)\r?\n\]/);
    if (!featuresMatch) return { pageId, file: pagePath.replace(WORKSPACE_ROOT + '\\', '').replace(/\\/g, '/'), hasFeatures: false };

    const featRegex = /\{\s*label:\s*['"]([^'"]+)['"]\s*,\s*code:\s*['"]([^'"]+)['"]\s*\}/g;
    const features = [];
    let fm;
    while ((fm = featRegex.exec(featuresMatch[1])) !== null) {
      features.push({ label: fm[1], code: fm[2] });
    }
    return { pageId, features };
  }

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;

      // Khi gặp thư mục "pages" → quét file .tsx bên trong
      if (entry.name === 'pages') {
        const pageFiles = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const pf of pageFiles) {
          if (!pf.isFile() || !pf.name.endsWith('.tsx')) continue;
          const result = extractFromPageFile(path.join(fullPath, pf.name));
          if (!result) continue;
          if (result.features) {
            mapping[result.pageId] = result.features;
          } else {
            missing.push({ file: result.file, pageId: result.pageId });
          }
        }
      } else {
        // Thư mục khác → đệ quy
        walkDir(fullPath);
      }
    }
  }

  walkDir(fullDir);
  return { mapping, missing };
}

/**
 * Dự đoán featureType từ label tiếng Việt
 */
function guessFeatureType(label) {
  const l = label.toLowerCase();
  if (/\b(tạo|xem|danh sách|xem chi tiết|làm mới|tổng quan)\b/.test(l)) return 1;       // View
  if (/\b(tạo mới|thêm|tạo hóa đơn|tạo chứng từ)\b/.test(l)) return 2;                 // Create
  if (/\b(sửa|chỉnh sửa|cập nhật|điều chỉnh|thay thế|thay đổi)\b/.test(l)) return 3;  // Edit
  if (/\b(xóa|hủy|hủy bỏ)\b/.test(l)) return 4;                                         // Delete
  if (/\b(xuất|export|tải xuống)\b/.test(l)) return 5;                                  // Export
  if (/\b(nhập|import|tải lên)\b/.test(l)) return 6;                                    // Import
  if (/\b(ký|gửi ký|phê duyệt)\b/.test(l)) return 7;                                    // Approve/Sign
  if (/\b(gửi email|email|mail|thông báo)\b/.test(l)) return 10;                        // SendEmail
  if (/\b(tra cứu|tìm kiếm|kiểm tra|lịch sử|xml|link)\b/.test(l)) return 1;            // View
  return 1; // default View
}

/**
 * Chuyển PAGE_FEATURES metadata → DB feature format
 * Dùng derivePermissionCode để sinh permissionCode chuẩn
 */
function convertPageFeaturesToDbFeatures(pageFeatures, prefix, menuCode) {
  return pageFeatures.map((pf, idx) => {
    // Giữ nguyên code (bao gồm prefix btn-/row-/batch-) để đảm bảo uniqueness
    const featureCode = pf.code;
    const featureType = guessFeatureType(pf.label);
    return {
      featureCode: featureCode.replace(/^(btn-|row-|batch-)/, ''),
      featureName: pf.label,
      description: `Cho phép: ${pf.label.toLowerCase()}`,
      featureType,
      permissionCode: derivePermissionCode(prefix, menuCode, featureCode),
      isActive: true,
      sortOrder: idx + 1,
    };
  });
}

// ── Sinh Features cho Page ──────────────────────────────────────────────────

/**
 * FeatureType enum (khớp backend)
 * 1=View, 2=Create, 3=Edit, 4=Delete, 5=Export, 6=Import,
 * 7=Approve, 8=Reject, 9=Print, 10=SendEmail, 11=Search
 */
const FEATURE_TYPES = {
  view: { type: 1, label: 'Xem' },
  create: { type: 2, label: 'Tạo mới' },
  edit: { type: 3, label: 'Chỉnh sửa' },
  delete: { type: 4, label: 'Xóa' },
  cancel: { type: 4, label: 'Hủy' },
  export: { type: 5, label: 'Xuất dữ liệu' },
  import: { type: 6, label: 'Nhập dữ liệu' },
  approve: { type: 7, label: 'Phê duyệt' },
  reject: { type: 8, label: 'Từ chối' },
  print: { type: 9, label: 'In' },
  sendEmail: { type: 10, label: 'Gửi email' },
  search: { type: 11, label: 'Tìm kiếm' },
};

/**
 * Sinh permissionCode từ prefix + featureCode (unique per page)
 * VD: "INV" + "refresh" → "Invoice.Refresh"
 */
function derivePermissionCode(prefix, menuCode, featureCode) {
  const parts = menuCode ? menuCode.split('_').slice(1) : [];
  // PascalCase hóa featureCode (kebab-case → PascalCase)
  const pascalFeature = featureCode.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  if (parts.length > 0) {
    const module = parts.slice(0, 2).map(p => p.charAt(0) + p.slice(1).toLowerCase()).join('');
    return `${module}.${pascalFeature}`;
  }
  const moduleMap = {
    INV: 'Invoice', ADM: 'Admin', PTN: 'Partner', ACC: 'Accounting',
    TEST: 'Test', TAS: 'TaiSan', CRM: 'Crm', BASE: 'BaseIndex',
  };
  return `${moduleMap[prefix] || prefix}.${pascalFeature}`;
}

/**
 * Lấy features cho 1 nav item — CHỈ từ PAGE_FEATURES trong source code
 * Không auto-gen bất kỳ feature nào.
 */
function mergeFeatures(portal, navItemId, pageLabel, menuCode, parentLabel) {
  const pageFeats = (portal._pageFeatures && portal._pageFeatures[navItemId]) || [];
  if (pageFeats.length === 0) return [];   // Không có khai báo → không có features
  return convertPageFeaturesToDbFeatures(pageFeats, portal.prefix, menuCode);
}

// ── Xây dựng URL cho menu item ─────────────────────────────────────────────

/**
 * Tạo URL cho nav menu item dựa trên portal config
 */
function buildUrl(portal, topMenuId, navItem) {
  // Kiểm tra urlOverrides trước
  if (portal.urlOverrides[navItem.id]) {
    return portal.urlOverrides[navItem.id];
  }

  // Flat URL (CRM, TaiSan, KiemThu)
  if (portal.flatUrl) {
    return `${portal.urlBase}/${navItem.id}`;
  }

  // Path convention: /module/topMenu/navItem
  return `${portal.urlBase}/${topMenuId}/${navItem.id}`;
}

// ── Export chính ───────────────────────────────────────────────────────────

/**
 * Mapping folder trong shared services
 */
const MAPPING_DIR = path.join(WORKSPACE_ROOT, 'src', 'shared', 'services', 'permissionMappings');

/**
 * Tự động sinh / cập nhật file PermissionMapping.{Portal}.ts
 * từ dữ liệu menu vừa export.
 */
function syncPermissionMapping(portal, menus) {
  if (!portal.mappingFile) {
    console.log('  ⏭️  Không có mappingFile config, bỏ qua sync-mapping.');
    return;
  }

  if (!fs.existsSync(MAPPING_DIR)) {
    fs.mkdirSync(MAPPING_DIR, { recursive: true });
  }

  const mappingFilePath = path.join(MAPPING_DIR, portal.mappingFile);
  const varName = `${portal.appTypeName.toUpperCase()}_PERMISSION_MAPPING`;

  // Xây dựng entries từ menus
  const entries = [];
  let childCount = 0;
  for (const topMenu of menus) {
    if (!topMenu.children) continue;
    const topCode = topMenu.menuCode;
    const topName = topMenu.menuName;
    for (const child of topMenu.children) {
      const entry = `  '${child.menuCode}': ${JSON.stringify({
        topMenuCode: topMenu.navMenuId || topMenu.id,
        navMenuCode: child.navMenuId || child.menuCode.split('_').slice(1).join('-').toLowerCase(),
        topMenuName: topMenu.menuName,
        navMenuName: child.menuName,
        pageName: child.menuName,
      }, null, 2).replace(/\n/g, '\n  ')}`;
      entries.push(entry);
      childCount++;
    }
  }

  const content = `/**
 * Permission Mapping — ${portal.fullName} (appType=${portal.appType})
 *
 * Mapping từ SSO menuCode → { topMenuCode, navMenuCode, ... }
 * dùng để normalize dữ liệu từ SSO login response về format NavMenu/TopMenu.
 *
 * ⚠️  FILE TỰ SINH — được cập nhật bởi export-menu.cjs khi chạy:
 *     node .claude/skills/export-menu-page-permission/export-menu.cjs --portal ${portal.shortName} --sync-mapping
 */

import type { PermissionMapping } from './types'

export const ${varName}: Record<string, PermissionMapping> = {
${entries.join(',\n')},
}
`;

  fs.writeFileSync(mappingFilePath, content, 'utf8');
  console.log(`\n  🗺️  Sync mapping: ${childCount} entries → ${portal.mappingFile}`);

  // Cập nhật barrel index.ts nếu có entry mới
  syncBarrelIndex(portal);
}

/**
 * Cập nhật barrel index.ts để import mapping file mới (nếu chưa có)
 */
function syncBarrelIndex(portal) {
  const indexPath = path.join(MAPPING_DIR, 'index.ts');
  if (!fs.existsSync(indexPath)) return;

  let content = fs.readFileSync(indexPath, 'utf8');
  const importName = `${portal.appTypeName.toUpperCase()}_PERMISSION_MAPPING`;
  const importLine = `import { ${importName} } from './${portal.mappingFile.replace('.ts', '')}'`;
  const spreadLine = `  ...${importName},`;

  if (content.includes(importName)) {
    console.log('  ✓ Barrel index đã có import, bỏ qua.');
    return;
  }

  // Thêm import sau dòng import cuối cùng từ './PermissionMapping.'
  const lastImportIdx = content.lastIndexOf("from './PermissionMapping.");
  if (lastImportIdx !== -1) {
    const lastImportEnd = content.indexOf('\n', lastImportIdx);
    if (lastImportEnd !== -1) {
      const semicolonIdx = content.lastIndexOf(';', lastImportEnd);
      content = content.slice(0, (semicolonIdx !== -1 ? semicolonIdx : lastImportEnd) + 1) + '\n' + importLine + ';\n' + content.slice((semicolonIdx !== -1 ? semicolonIdx : lastImportEnd) + 1);
    }
  }

  // Thêm spread vào ALL_PERMISSION_MAPPINGS (sau dấu { mở)
  content = content.replace(
    /(export const ALL_PERMISSION_MAPPINGS[^}]*?= \{\n)([\s\S]*?)(\n\})/,
    (_match, prefix, body, suffix) => {
      if (body.includes(importName)) return _match;
      return prefix + body + '\n' + spreadLine + suffix;
    }
  );

  // Thêm tên vào export line cuối
  content = content.replace(
    /(export \{ [^}]+)/,
    (match) => {
      if (match.includes(importName)) return match;
      return match + `, ${importName}`;
    }
  );

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('  ✓ Barrel index đã được cập nhật.');
}

// ── Validate cấu trúc portal (BƯỚC 1) ─────────────────────────────────────

/**
 * Kiểm tra điều kiện cấu trúc portal trước khi export.
 * Trả về { ok: boolean, errors: string[] }
 * - File TopMenu tồn tại + trích xuất được top menu (nếu portal có topMenuFile)
 * - File NavMenu tồn tại + trích xuất được nav menu (nếu portal có navMenuFile)
 * - Mọi page có PAGE_ID + PAGE_FEATURES đầy đủ (không thiếu)
 */
function validatePortalStructure(portalKey) {
  const portal = PORTALS[portalKey];
  if (!portal) {
    return { ok: false, errors: [`Portal "${portalKey}" không tồn tại.`] };
  }

  const errors = [];

  // 1. TopMenu
  if (portal.topMenuFile) {
    const topMenuPath = path.join(WORKSPACE_ROOT, portal.topMenuFile);
    if (!fs.existsSync(topMenuPath)) {
      errors.push(`Không tìm thấy file TopMenu: ${portal.topMenuFile}`);
    } else {
      const topMenus = extractTopMenuConfig(fs.readFileSync(topMenuPath, 'utf8'));
      if (topMenus.length === 0) {
        errors.push(`Không trích xuất được top menu từ: ${portal.topMenuFile}`);
      }
    }
  }

  // 2. NavMenu
  if (portal.navMenuFile) {
    const navMenuPath = path.join(WORKSPACE_ROOT, portal.navMenuFile);
    if (!fs.existsSync(navMenuPath)) {
      errors.push(`Không tìm thấy file NavMenu: ${portal.navMenuFile}`);
    } else {
      const navMenuItems = extractNavMenuItems(fs.readFileSync(navMenuPath, 'utf8'));
      if (Object.keys(navMenuItems).length === 0) {
        errors.push(`Không trích xuất được nav menu từ: ${portal.navMenuFile}`);
      }
    }
  }

  // 3. PAGE_FEATURES
  if (portal.featuresDir) {
    const scanResult = scanPageFeatures(portal.featuresDir);
    if (scanResult.missing.length > 0) {
      scanResult.missing.forEach(m => {
        errors.push(`Page thiếu PAGE_FEATURES: ${m.pageId} (file: ${m.file})`);
      });
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Ghi kết quả pre-check FAIL vào export-json/pre-check-fail-{ddMMyyyy}.md
 * Để Agent đọc thông tin file + vấn đề rồi fix.
 * Nếu file đã tồn tại trong ngày → append thêm section (giữ lịch sử các lần fail).
 */
function writePreCheckFailFile(portal, errors) {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const dateStr = formatDate(new Date());
  const fileName = `pre-check-fail-${dateStr}.md`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  const timeStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  const lines = [];
  lines.push(`## ${portal.fullName} (key: ${portal.shortName}) — ${timeStr}`);
  lines.push('');
  errors.forEach((e, i) => lines.push(`${i + 1}. ${e}`));
  lines.push('');

  const section = lines.join('\n');

  // Append nếu file đã tồn tại (giữ lịch sử các lần fail trong ngày)
  const header = fs.existsSync(filePath)
    ? '\n---\n\n'
    : '# Pre-check FAIL — Cấu trúc portal chưa đúng\n\n';
  fs.appendFileSync(filePath, header + section, 'utf8');

  console.error(`\n📄 Đã ghi báo cáo lỗi: ${filePath}`);
  return filePath;
}

// ── Export portal ───────────────────────────────────────────────────────

/**
 * Export 1 portal thành JSON object
 */
function exportPortal(portalKey, options = {}) {
  const { syncMapping = false } = options;
  const portal = PORTALS[portalKey];
  if (!portal) {
    throw new Error(`Portal "${portalKey}" không tồn tại. Các portal hợp lệ: ${Object.keys(PORTALS).join(', ')}`);
  }

  // ── Đọc TopMenu ──
  const topMenuPath = path.join(WORKSPACE_ROOT, portal.topMenuFile);
  if (!fs.existsSync(topMenuPath)) {
    console.error(`[ERROR] Không tìm thấy file TopMenu: ${topMenuPath}`);
    return null;
  }
  const topMenuContent = fs.readFileSync(topMenuPath, 'utf8');
  const topMenus = extractTopMenuConfig(topMenuContent);

  if (topMenus.length === 0) {
    console.error(`[ERROR] Không trích xuất được top menu từ: ${topMenuPath}`);
    return null;
  }

  // ── Đọc NavMenu ──
  const navMenuPath = path.join(WORKSPACE_ROOT, portal.navMenuFile);
  if (!fs.existsSync(navMenuPath)) {
    console.error(`[ERROR] Không tìm thấy file NavMenu: ${navMenuPath}`);
    return null;
  }
  const navMenuContent = fs.readFileSync(navMenuPath, 'utf8');
  const navMenuItems = extractNavMenuItems(navMenuContent);

  // ── Đọc RouteConfig (nếu có) ──
  if (portal.routeConfigFile) {
    const routePath = path.join(WORKSPACE_ROOT, portal.routeConfigFile);
    if (fs.existsSync(routePath)) {
      const routeContent = fs.readFileSync(routePath, 'utf8');
      portal.urlOverrides = extractUrlMappings(routeContent, portal.urlBase);
    }
  }

  // ── Scan PAGE_FEATURES từ source code ──
  if (portal.featuresDir) {
    const scanResult = scanPageFeatures(portal.featuresDir);
    portal._pageFeatures = scanResult.mapping;
    portal._missingFeatures = scanResult.missing;
  }

  // ── Xây dựng JSON ──
  const menus = [];
  let totalChildren = 0;

  for (let i = 0; i < topMenus.length; i++) {
    const topMenu = topMenus[i];
    const parentCode = generateTopMenuCode(portal.prefix, topMenu.label);
    const children = navMenuItems[topMenu.id] || [];
    totalChildren += children.length;

    const topNode = {
      menuCode: parentCode,
      menuName: topMenu.label,
      menuNameEn: generateEnglishName(topMenu.label),
      description: generateDescription(topMenu.label, true),
      icon: topMenu.icon,
      isTopMenu: true,
      isNavMenu: false,
      navMenuId: topMenu.id,
      url: buildUrl(portal, topMenu.id, children[0] || { id: topMenu.id }),
      displayOrder: i + 1,
      level: 0,
      target: 1,
      isActive: true,
    };

    if (children.length > 0) {
      topNode.children = children.map((child, childIdx) => ({
        menuCode: generateChildMenuCode(portal.prefix, parentCode, child.label),
        menuName: child.label,
        menuNameEn: generateEnglishName(child.label),
        description: generateDescription(child.label, false),
        icon: child.icon || topMenu.icon,
        isTopMenu: false,
        isNavMenu: true,
        parentMenuCode: parentCode,
        navMenuId: child.id,
        url: buildUrl(portal, topMenu.id, child),
        displayOrder: childIdx + 1,
        level: 1,
        target: 1,
        isActive: true,
        features: mergeFeatures(
          portal,
          child.id,
          child.label,
          generateChildMenuCode(portal.prefix, parentCode, child.label),
          topMenu.label
        ),
      }));
    }

    menus.push(topNode);
  }

  // ── 🔴 VALIDATION: Kiểm tra trùng permissionCode trong mỗi trang ──
  const dupErrors = [];
  menus.forEach(m => {
    if (!m.children) return;
    m.children.forEach(child => {
      if (!child.features || child.features.length === 0) return;
      const codes = child.features.map(f => f.permissionCode);
      const seen = new Set();
      const dupInChild = [];
      codes.forEach((code, idx) => {
        if (seen.has(code)) {
          dupInChild.push({ code, index: idx + 1, featureName: child.features[idx].featureName });
        }
        seen.add(code);
      });
      if (dupInChild.length > 0) {
        dupErrors.push({
          menuCode: child.menuCode,
          menuName: child.menuName,
          pageId: child.menuCode.split('_').slice(1).join('-').toLowerCase(),
          duplicates: dupInChild,
          allCodes: child.features.map(f => `${f.featureCode} → ${f.permissionCode}`),
        });
      }
    });
  });

  if (dupErrors.length > 0) {
    console.error(`\n=======================================================================`);
    console.error(`❌ LỖI NGHIÊM TRỌNG: Phát hiện ${dupErrors.length} trang có permissionCode TRÙNG LẶP!`);
    console.error(`   Mỗi feature trong 1 trang PHẢI có permissionCode DUY NHẤT.`);
    console.error(`   Kiểm tra PAGE_FEATURES trong file page .tsx tương ứng.`);
    console.error(`=======================================================================`);
    dupErrors.forEach(err => {
      console.error(`\n📄 Trang: ${err.menuName} (${err.menuCode})`);
      console.error(`   pageId: ${err.pageId}`);
      console.error(`   Trùng lặp:`);
      err.duplicates.forEach(d => {
        console.error(`     #${d.index} "${d.featureName}" → permissionCode: ${d.code} (ĐÃ TRÙNG)`);
      });
      console.error(`   Toàn bộ features:`);
      err.allCodes.forEach(c => console.error(`     ${c}`));
    });
    console.error(`\n=======================================================================`);
    console.error(`Hướng dẫn sửa:`);
    console.error(`  1. Mở file page .tsx tương ứng`);
    console.error(`  2. Đảm bảo mỗi feature có code DUY NHẤT`);
    console.error(`  3. Dùng prefix khác nhau: btn- (nút toolbar), row- (thao tác dòng), batch- (hàng loạt)`);
    console.error(`  4. VD: btn-refresh, row-view, batch-delete → 3 permissionCode khác nhau`);
    console.error(`=======================================================================`);
    process.exit(1);
  }

  // ── Log warning các trang thiếu PAGE_FEATURES ──
  if (portal._missingFeatures && portal._missingFeatures.length > 0) {
    // Chỉ log các trang đang có trong NavMenu (có pageId khớp)
    const navIds = new Set();
    menus.forEach(m => {
      if (m.children) m.children.forEach(c => navIds.add(c.menuCode && c.menuCode.split('_').slice(1).join('-').toLowerCase()));
    });
    const relevantMissing = portal._missingFeatures.filter(f => navIds.has(f.pageId));
    if (relevantMissing.length > 0) {
      console.log(`\n  ⚠️  ${relevantMissing.length} nav menu CHƯA có PAGE_FEATURES (sẽ chỉ có features cơ bản):`);
      relevantMissing.forEach(f => console.log(`     ${f.pageId} ← ${f.file}`));
    }
  }

  // ── 🗺️  Sync permission mapping nếu có flag --sync-mapping ──
  if (syncMapping) {
    syncPermissionMapping(portal, menus);
  }

  return {
    version: '2.0.0',
    exportDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(' ', 'T') + '.0000000+07:00',
    exportedBy: 'system',
    appType: portal.appType,
    appTypeName: portal.appTypeName,
    totalMenus: menus.length + totalChildren,
    menus,
  };
}

/**
 * Export tất cả portal
 */
function exportAll(options = {}) {
  const { syncMapping = false } = options;
  const results = {};
  for (const key of Object.keys(PORTALS)) {
    console.log(`\n[INFO] Exporting portal: ${key} (${PORTALS[key].name})...`);
    try {
      const data = exportPortal(key, { syncMapping });
      if (data) {
        results[key] = data;
        console.log(`  ✓ ${data.totalMenus} menu items exported`);
      }
    } catch (err) {
      console.error(`  ✗ Lỗi: ${err.message}`);
    }
  }
  return results;
}

// ── Ghi file ────────────────────────────────────────────────────────────────

/**
 * Format ngày tháng: ddMMyyyy
 */
function formatDate(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}${m}${y}`;
}

/**
 * Ghi JSON ra file
 * Format: {shortName}_export_{ddMMyyyy}.json
 */
function writeJsonFile(portal, data, topMenuName) {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const dateStr = formatDate(new Date());
  let fileName;

  if (topMenuName) {
    fileName = `${portal.shortName}_${topMenuName}_export_${dateStr}.json`;
  } else {
    fileName = `${portal.shortName}_export_${dateStr}.json`;
  }

  const filePath = path.join(EXPORTS_DIR, fileName);
  // Xóa file cũ nếu trùng tên
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n[DONE] File đã được tạo: ${filePath}`);
  return filePath;
}

/**
 * Ghi tất cả portal vào 1 file
 */
function writeAllJsonFile(allData) {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const dateStr = formatDate(new Date());
  const fileName = `all_export_${dateStr}.json`;

  // Gộp tất cả menus vào 1 mảng
  const combined = {
    version: '2.0.0',
    exportDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(' ', 'T') + '.0000000+07:00',
    exportedBy: 'system',
    portals: Object.entries(allData).map(([key, data]) => ({
      portalKey: key,
      portalName: PORTALS[key].fullName,
      appType: data.appType,
      appTypeName: data.appTypeName,
      totalMenus: data.totalMenus,
      menus: data.menus,
    })),
  };

  const filePath = path.join(EXPORTS_DIR, fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`\n[DONE] File tổng hợp đã được tạo: ${filePath}`);
  return filePath;
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Export Menu & Page Permission — SASUCO InvoiceEasy         ║
╠══════════════════════════════════════════════════════════════╣
║  Cách dùng:                                                 ║
║    node export-menu.js                                      ║
║      → Interactive mode (hỏi từng bước)                     ║
║                                                              ║
║    node export-menu.js --portal <key>                       ║
║      → Export 1 portal cụ thể                               ║
║      → Keys: ${Object.keys(PORTALS).join(', ')}             ║
║                                                              ║
║    node export-menu.js --all                                ║
║      → Export tất cả portal                                 ║
║                                                              ║
║    node export-menu.js --portal <key> --sync-mapping         ║
║      → Export + tự động cập nhật PermissionMapping.{X}.ts   ║
║                                                              ║
║    node export-menu.js --list                               ║
║      → Liệt kê tất cả portal                                ║
╚══════════════════════════════════════════════════════════════╝
`);
}

function listPortals() {
  console.log('\n📋 Danh sách portal khả dụng:\n');
  console.log('Key'.padEnd(15), '|', 'Tên đầy đủ'.padEnd(35), '|', 'appType'.padEnd(8), '|', 'Prefix');
  console.log('-'.repeat(80));
  for (const [key, portal] of Object.entries(PORTALS)) {
    console.log(
      key.padEnd(15),
      '|',
      portal.fullName.padEnd(35),
      '|',
      String(portal.appType).padEnd(8),
      '|',
      portal.prefix
    );
  }
  console.log('');
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const syncMapping = args.includes('--sync-mapping');

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.includes('--list')) {
    listPortals();
    return;
  }

  if (args.includes('--all')) {
    console.log('[INFO] Exporting tất cả portal...');
    if (syncMapping) console.log('[INFO] + Sync permission mapping...');
    const allData = exportAll({ syncMapping });
    writeAllJsonFile(allData);
    return;
  }

  const portalIdx = args.indexOf('--portal');
  if (portalIdx !== -1 && args[portalIdx + 1]) {
    const portalKey = args[portalIdx + 1].toLowerCase();
    if (!PORTALS[portalKey]) {
      console.error(`[ERROR] Portal "${portalKey}" không tồn tại.`);
      console.error(`Các portal hợp lệ: ${Object.keys(PORTALS).join(', ')}`);
      process.exit(1);
    }

    console.log(`[INFO] Exporting portal: ${portalKey} (${PORTALS[portalKey].fullName})...`);
    if (syncMapping) console.log('[INFO] + Sync permission mapping...');
    const data = exportPortal(portalKey, { syncMapping });
    if (data) {
      writeJsonFile(PORTALS[portalKey], data);
      console.log(`  ✓ ${data.totalMenus} menu items (${data.menus.length} top + children)`);
    }
    return;
  }

  // Interactive mode — chọn portal → BƯỚC 1 kiểm tra cấu trúc → BƯỚC 2 export
  console.log('\n📤 EXPORT MENU & PAGE PERMISSION\n');
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise((r) => readline.question(q, r));

  (async () => {
    console.log('📋 Danh sách portal:');
    const keys = Object.keys(PORTALS);
    keys.forEach((key, i) => {
      const p = PORTALS[key];
      console.log(`  ${i + 1}. ${key.padEnd(12)} | ${p.fullName.padEnd(35)} | appType=${p.appType}`);
    });

    const choice = (await question(`\nChọn portal (1-${keys.length}): `)) || '';
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= keys.length) {
      console.error('[ERROR] Lựa chọn không hợp lệ.');
      readline.close();
      process.exit(1);
    }

    const portalKey = keys[idx];
    const portal = PORTALS[portalKey];

    // ── BƯỚC 1: Kiểm tra điều kiện cấu trúc ──
    console.log(`\n🔍 BƯỚC 1 — Kiểm tra cấu trúc portal "${portalKey}" (${portal.fullName})...`);
    const check = validatePortalStructure(portalKey);
    if (!check.ok) {
      console.error('\n❌ CẤU TRÚC PORTAL CHƯA ĐÚNG — DỪNG EXPORT.\n');
      check.errors.forEach(e => console.error(`   ✗ ${e}`));
      console.error('\n➡️  Yêu cầu Agent kiểm tra và khai báo lại đúng cấu trúc, sau đó chạy lại script.');
      console.error('   Tham khảo: .claude/skills/export-menu-page-permission/rule-tao-json-menu-phan-quyen/export-cau-truc-phan-quyen.rule.md');
      writePreCheckFailFile(portal, check.errors);
      readline.close();
      process.exit(1);
    }
    console.log('   ✅ Cấu trúc hợp lệ.');

    // ── BƯỚC 2: Export ──
    const confirm = (await question('\n📦 BƯỚC 2 — Export JSON vào export-json/. Tiếp tục? (y/n): ')) || '';
    if (confirm.toLowerCase() !== 'y') {
      console.log('Đã hủy export.');
      readline.close();
      return;
    }

    readline.close();
    console.log(`[INFO] Exporting portal: ${portalKey} (${portal.fullName})...`);
    const data = exportPortal(portalKey);
    if (data) {
      writeJsonFile(portal, data);
      console.log(`  ✓ ${data.totalMenus} menu items (${data.menus.length} top + children)`);
      console.log('\n📋 Top menus:');
      data.menus.forEach((m, i) => {
        const childCount = m.children?.length || 0;
        console.log(`  ${i + 1}. ${m.menuName} (${childCount} children)`);
      });
    }
    return;
  })();
}

// ── Run ─────────────────────────────────────────────────────────────────────
main();
