import template from './index.html?raw';

const PrivacyPolicy = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: template }} />
  );
};

export default PrivacyPolicy;
