import React from "react";
import "./Footer.scss";
import logo from "./assets/logo.png";

import location_icon from "./assets/location_icon.svg";
import phone_icon from "./assets/phone_icon.svg";
import email_icon from "./assets/mail_icon.svg";

export default function Footer() {
  return (
    <footer id="custom-footer" className="border-top">
      <div className="footer-container">
        {/* Logo, address, phone */}
        <div className="footer-section">
          <div className="footer-section-logo">
            <img src={logo} alt="logo" />
          </div>
          <p className="footer-section-location">
            <img src={location_icon} alt="location_icon" />
            Tầng 0, tòa nhà FPT, 17 Duy Tân, Cầu Giấy, Hà Nội
          </p>
          <p className="footer-section-email">
            <img src={email_icon} alt="email_icon" />
            info@funix.edu.vn
          </p>
          <p className="footer-section-phone">
            <img src={phone_icon} alt="phone_icon" />
            0782 313 602 (Zalo, Viber)
          </p>
        </div>

        {/* About us */}
        {/* <div className="footer-section">
          <h3>Về chúng tôi</h3>
          <ul>
            <li>
              <a href="https://funix.edu.vn/gioi-thieu-funix">
                Giới thiệu FUNiX
              </a>
            </li>
            <li>
              <a href="https://funix.edu.vn/mentor/">Đội ngũ Mentor</a>
            </li>
            <li>
              <a href="https://funix.edu.vn/hop-tac/">Hợp tác</a>
            </li>
            <li>
              <a href="https://funix.edu.vn/lien-he/">Liên hệ</a>
            </li>
            <li>
              <a href="https://funix.edu.vn/faq-2/">FAQ</a>
            </li>
          </ul>
        </div> */}

        {/* information */}
        {/* <div className="footer-section">
          <h3>Học gì ở FUNiX</h3>
          <ul>
            <li>
              <a href="https://funix.edu.vn/chuong-trinh-hoc-funix/">
                Chương trình học
              </a>
            </li>
            <li>
              <a href="https://funix.edu.vn/hoc-phi/">Học phí</a>
            </li>
            <li>
              <a href="https://funix.edu.vn/phuong-phap-hoc-truc-tuyen-hieu-qua/">
                Cách Học
              </a>
            </li>
            <li>
              <a href="https://events.funix.edu.vn/xter">Đời sống sinh viên</a>
            </li>
          </ul>
        </div> */}

        {/* News */}
        {/* <div className="footer-section">
          <h3>Tin tức</h3>
          <ul>
            <li>
              <a href="https://funix.edu.vn/funix-activities/">Học đường</a>
            </li>
            <li>
              <a href="https://funix.edu.vn/events/">Sự kiện</a>
            </li>
          </ul>
        </div> */}
      </div>

      <div className="footer-bottom">
        <p>
          {/* @2023. All rights reserved. FUNIX-A member of FPT Corporation
          funix.edu.vn */}
          ©2023. Đã đăng ký Bản quyền. FUNIX-Thành viên của Tập đoàn FPT
          funix.edu.vn
        </p>
      </div>
    </footer>
  );
}
