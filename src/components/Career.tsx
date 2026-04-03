import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>MBA Candidate</h4>
                <h5>University of North Carolina at Chapel Hill, USA</h5>
              </div>
              <h3>2025–2027</h3>
            </div>
            <p>
              Pursuing MBA with concentrations in Product Management and Consulting. Actively building a strong foundation in business strategy, finance, and leadership while exploring opportunities in the US market.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior Associate - Management Consulting</h4>
                <h5>PwC Advisory, New York</h5>
              </div>
              <h3>2026–2026</h3>
            </div>
            <p>
              Joining PwC Advisory as a Senior Associate - Management Consulting in the Financial Services industry. This role will leverage my technical background and business acumen to deliver strategic solutions to clients in the banking, insurance, and capital markets sectors.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior Software Engineer</h4>
                <h5>Fiserv</h5>
              </div>
              <h3>2021–2025</h3>
            </div>
            <p>
              Spent four years as a software engineer working on cloud infrastructure, AI, and product strategy. I helped build tools that made it easier for internal teams to move to the cloud, saving the company millions of dollars and hundreds of thousands of hours of work. I also built a machine learning model to identify cost-saving opportunities across the company's cloud systems, and led an AI initiative that cut the time developers spent on testing by 40%. Beyond the technical work, I collaborated with business teams to improve the company's main website, drove go-to-market strategy, and mentored new hires — helping them get up to speed twice as fast.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Intern, Software Engineer in Test</h4>
                <h5>Doubtnut, ALLEN</h5>
              </div>
              <h3>2020–2020</h3>
            </div>
            <p>
              During my internship at Doubtnut, an AI-powered education startup serving over 32 million students in India, I worked on improving how the mobile app was tested before release. I built an automated testing system that cut manual testing effort in half, and introduced a way for non-technical business teams to write and run their own software tests using plain English — making the whole process faster and more collaborative for everyone involved.            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
