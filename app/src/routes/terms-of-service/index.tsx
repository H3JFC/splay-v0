import template from './index.html?raw';

const TermsOfService = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: template }} />
  );
};

export default TermsOfService;
