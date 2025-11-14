import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Solid icons
import {
  faHome,
  faBell,
  faBoxOpen,
  faBoxes,
  faTools,
  faUsers,
  faClipboardList,
  faChartLine,
  faUser,
  faQuestionCircle,
  faBars,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faCog,
  faCheckCircle,
  faDollarSign,
  faHistory,
  faUserCircle,
  faLock,
  faClipboard,
  faMusic,
  faMapMarkerAlt,
  faCrown,
  faUserPlus,
  faTimes,
  faCalendarAlt,
  faClock,
  faConciergeBell,
  faInfoCircle,
  faDownload,
  faDrum,
  faChartBar,
  faBoxes as faBoxesIcon,
  faUserShield,
  faUserSlash,
  faBan,
  faCompactDisc,
  faEdit,
  faSave,
  faToggleOn,
  faToggleOff,
  faUserFriends,
  faExclamationTriangle,
  faExclamationCircle,
  faTimesCircle,
  faSort,
  faSortUp,
  faSortDown,
  faUserCheck,
  faArchive,
  faBookOpen,
  faThumbsUp,
  faThumbsDown,
  faUndo,
  faFilter,
  faPrint,
  faCommentDots,
  faEyeSlash,
  faKeyboard,
  faTruck,
  faUtensils,
  faMobileAlt,
  faFileAlt,
  faBirthdayCake,
  faGuitar,
  faEllipsisV,
  faPlus,
  faBox,
  faChevronDown,
  faChevronUp,
  faEnvelope,
  faPhone,
  faPhoneAlt,
  faCheck,
  faSpinner,
  faFileInvoiceDollar,
  faEye,
  faArrowLeft,
  faReceipt,
  faArrowUp,
  faCreditCard,
  faClock as faClockIcon,
  faVolumeUp,
  faSync,
  faTrash,
  faArrowRight,
  faCalendar,
  faIdCard,
  faFlag,
  faChalkboardTeacher,
  faUniversity
} from '@fortawesome/free-solid-svg-icons';

// Brands (social icons)
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faTwitter,
  faFacebook,
  faGoogle
} from '@fortawesome/free-brands-svg-icons';

// Helper wrapper to accept `size` (number) and `color` props similar to react-icons
const wrap = (icon) => (props) => {
  const { size, color, style, ...rest } = props || {};
  const fontSizeStyle = size ? { fontSize: typeof size === 'number' ? size : size } : {};
  const colorStyle = color ? { color } : {};
  return <FontAwesomeIcon icon={icon} style={{ ...(style || {}), ...fontSizeStyle, ...colorStyle }} {...rest} />;
};

export const FaHome = wrap(faHome);
export const FaBell = wrap(faBell);
export const FaBoxOpen = wrap(faBoxOpen);
export const FaBoxes = wrap(faBoxesIcon);
export const FaTools = wrap(faTools);
export const FaUsers = wrap(faUsers);
export const FaClipboardList = wrap(faClipboardList);
export const FaChartLine = wrap(faChartLine);
export const FaUser = wrap(faUser);
export const FaQuestionCircle = wrap(faQuestionCircle);
export const FaBars = wrap(faBars);
export const FaSignOutAlt = wrap(faSignOutAlt);
export const FaChevronLeft = wrap(faChevronLeft);
export const FaChevronRight = wrap(faChevronRight);
export const FaSearch = wrap(faSearch);
export const FaCog = wrap(faCog);
export const FaCheckCircle = wrap(faCheckCircle);
export const FaDollarSign = wrap(faDollarSign);
export const FaHistory = wrap(faHistory);
export const FaUserCircle = wrap(faUserCircle);
export const FaLock = wrap(faLock);
export const FaClipboard = wrap(faClipboard);
export const FaMusic = wrap(faMusic);
export const FaMapMarkerAlt = wrap(faMapMarkerAlt);
export const FaCrown = wrap(faCrown);
export const FaUserPlus = wrap(faUserPlus);
export const FaTimes = wrap(faTimes);
export const FaCalendarAlt = wrap(faCalendarAlt);
export const FaClock = wrap(faClockIcon);
export const FaConciergeBell = wrap(faConciergeBell);
export const FaInfoCircle = wrap(faInfoCircle);
export const FaDownload = wrap(faDownload);
export const FaDrum = wrap(faDrum);
export const FaChartBar = wrap(faChartBar);
export const FaExclamationTriangle = wrap(faExclamationTriangle);
export const FaFilter = wrap(faFilter);
export const FaPrint = wrap(faPrint);
export const FaGuitar = wrap(faGuitar);
export const FaEllipsisV = wrap(faEllipsisV);
export const FaEdit = wrap(faEdit);
export const FaSave = wrap(faSave);
export const FaToggleOn = wrap(faToggleOn);
export const FaToggleOff = wrap(faToggleOff);
export const FaUserFriends = wrap(faUserFriends);
export const FaUserShield = wrap(faUserShield);
export const FaUserSlash = wrap(faUserSlash);
export const FaBan = wrap(faBan);
export const FaCompactDisc = wrap(faCompactDisc);
export const FaExclamationCircle = wrap(faExclamationCircle);
export const FaTimesCircle = wrap(faTimesCircle);
export const FaSort = wrap(faSort);
export const FaSortUp = wrap(faSortUp);
export const FaSortDown = wrap(faSortDown);
export const FaUserCheck = wrap(faUserCheck);
export const FaArchive = wrap(faArchive);
export const FaBookOpen = wrap(faBookOpen);
export const FaThumbsUp = wrap(faThumbsUp);
export const FaThumbsDown = wrap(faThumbsDown);
export const FaUndo = wrap(faUndo);
export const FaCalendar = wrap(faCalendar);
export const FaIdCard = wrap(faIdCard);
export const FaFlag = wrap(faFlag);
export const FaChalkboardTeacher = wrap(faChalkboardTeacher);
export const FaPhoneAlt = wrap(faPhoneAlt);
export const FaUniversity = wrap(faUniversity);
export const FaCommentDots = wrap(faCommentDots);
export const FaPlus = wrap(faPlus);
export const FaBox = wrap(faBox);
export const FaChevronDown = wrap(faChevronDown);
export const FaChevronUp = wrap(faChevronUp);
export const FaEyeSlash = wrap(faEyeSlash);
export const FaKeyboard = wrap(faKeyboard);
export const FaTruck = wrap(faTruck);
export const FaUtensils = wrap(faUtensils);
export const FaMobileAlt = wrap(faMobileAlt);
export const FaFileAlt = wrap(faFileAlt);
export const FaBirthdayCake = wrap(faBirthdayCake);
export const FaEnvelope = wrap(faEnvelope);
export const FaPhone = wrap(faPhone);
export const FaCheck = wrap(faCheck);
export const FaSpinner = wrap(faSpinner);
export const FaFileInvoiceDollar = wrap(faFileInvoiceDollar);
export const FaEye = wrap(faEye);
export const FaArrowLeft = wrap(faArrowLeft);
export const FaReceipt = wrap(faReceipt);
export const FaArrowUp = wrap(faArrowUp);
export const FaCreditCard = wrap(faCreditCard);
export const FaArrowRight = wrap(faArrowRight);
export const FaVolumeUp = wrap(faVolumeUp);
export const FaSync = wrap(faSync);
export const FaTrash = wrap(faTrash);

// Brand icons
export const FaFacebookF = wrap(faFacebookF);
export const FaInstagram = wrap(faInstagram);
export const FaYoutube = wrap(faYoutube);
export const FaTwitter = wrap(faTwitter);
export const FaFacebook = wrap(faFacebook);
export const FaGoogle = wrap(faGoogle);

// Default export (in case a file expects a default)
export default {
  FaHome,
  FaBell,
  FaBoxOpen,
  FaBoxes,
  FaTools,
  FaUsers,
  FaClipboardList,
  FaChartLine,
  FaUser,
  FaQuestionCircle,
  FaBars,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaCog,
  FaCheckCircle,
  FaDollarSign,
  FaHistory,
  FaUserCircle,
  FaLock,
  FaClipboard,
  FaMusic,
  FaMapMarkerAlt,
  FaCrown,
  FaUserPlus,
  FaTimes,
  FaCompactDisc,
  FaExclamationCircle,
  FaTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserCheck,
  FaArchive,
  FaBookOpen,
  FaThumbsUp,
  FaThumbsDown,
  FaUndo,
  FaCalendar,
  FaIdCard,
  FaFlag,
  FaChalkboardTeacher,
  FaPhoneAlt,
  FaUniversity,
  FaCalendarAlt,
  FaClock,
  FaConciergeBell,
  FaInfoCircle,
  FaDownload,
  FaDrum,
  FaChartBar,
  FaExclamationTriangle,
  FaFilter,
  FaPrint,
  FaGuitar,
  FaEllipsisV,
  FaPlus,
  FaBox,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaUserFriends,
  FaCommentDots,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaSpinner,
  FaFileInvoiceDollar,
  FaEye,
  FaArrowLeft,
  FaReceipt,
  FaArrowUp,
  FaCreditCard,
  FaArrowRight,
  FaVolumeUp,
  FaSync,
  FaTrash,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook
  ,
  FaGoogle
};
