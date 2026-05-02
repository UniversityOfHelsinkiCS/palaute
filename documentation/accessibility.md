# Accessibility statement of the course feedback system Norppa of the University of Helsinki

This accessibility statement applies to the accessibility of Norppa course feedback system, available at [norppa.helsinki.fi](norppa.helsinki.fi). The document was created on 11 October 2021 and last updated on 2 May 2026. The accessibility analysis of the software was done by the developers using both automated tools ([WAVE Evaluation Tool](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh) and [Lighthouse](https://developers.google.com/web/tools/lighthouse)) and manual testing methods, including keyboard and screen reader testing.

## Accessibility status

The system meets most of the A and AA level accessibility requirements of the Web Content Accessibility Guidelines (WCAG) 2.1. The accessibility deficiencies identified are described in detail below.

## Accessibility issues

This list includes the issues that have been identified in the accessibility evaluation in spring 2026. The evaluation is still in progress and the developers are actively working towards remediating the issues.

### Perceivability issues

- **Non-text content**: Not all non-text content has text alternatives. Most notably, feedback results are presented with visual charts that have no textual description or data table alternative. Although teachers can download the feedack as a table in XLSX format, text alternatives should be added to the website, too. (WCAG 1.1.1)
  - Update: Table alternatives were added for all feedback result charts. The user can change between chart and table view by pressing a button or using keyboard shortcut Alt + T.
- **Info and relationships**: A couple of pages skip heading levels making the structure of the page confusing. Also, document landmark roles are mostly missing, and form labels and validation errors are not always correctly connected with the inputs. (WCAG 1.3.1)
  - Update: Heading hierarchy was fixed and document landmark roles were added. Validation errors were connected with the inputs through aria-describedby attribute.
- **Contrast**: Some content has too low contrast between text and background colors, especially in Course summary page. (WCAG 1.4.3)
- **Reflow**: Some information can be lost with large zoom. This is true for at least the student table on feedback target's Respondents tab and the chips that inform the user that the teacher has responded to the given feedback. (WCAG 1.4.10)

### Operability issues

- **Keyboard**: User menu, feedback question type selection, and some individual interactions are not operable through a keyboard interface. (WCAG 2.1.1)
  - Update: User menu and feedback question type selection were made keyboard accessible.
- **Pause, stop, hide**: The counter feedback missing chip is pulsing and some other feedback chips have an animated "shimmering" effect that cannot be paused, stopped, or hidden. (WCAG 2.2.2)
- **Bypass blocks**: There are no 'Skip to content' links and document landmark roles are mostly missing. (WCAG 2.4.1)
  - Update: Skip links and document landmark roles were added.
- **Link purpose**: Images working as links (University of Helsinki and Toska logos) do not inform the user about the link's purpose. External links are only marked by visual icons. (WCAG 2.4.4)
  - Update: Descriptive aria-label / alt text was added to linked images and info 'opens in a new tab' was added to external links.
- **Headings and labels**: Some labels are missing or not correctly connected to the corresponding components. (WCAG 2.4.6)
- **Focus visible**: Keyboard focus indicators are not consistent and some of them are barely visible. (WCAG 2.4.7)
  - Update: Keyboard focus indicators have been improved to meet this criterion.

### Understandability issues

- **Language of parts**: In some cases, the language of some content on the page can be different from the language of the page, and this cannot be programmatically determined. This can be due to missing translations in source code or, in most cases, incomplete data provided by other systems or the users (for example: course name or feedback question not given in all three languages). (WCAG 3.1.2)
- **Error identification**: Form validation errors are not correctly connected to the corresponding inputs. (WCAG 3.3.1)
  - Update: Form validation errors were fixed. Additionally, an error summary with links to invalid inputs was added to feedback forms.
- **Labels or instructions**: Required form fields show a visual asterisk (\*) but do not set aria-required="true" on the input element. (WCAG 3.3.2)

### Robustness issues

- **Name, role, value**: Some icon buttons are missing an accessible name. (WCAG 4.1.2)
- **Status messages**: Loading states and form validation errors are not announced to screen readers. (WCAG 4.1.3)
  - Update: Form validation errors were fixed.

## Feedback

If you notice any accessibility issues while using the software, please, give us feedback by either contacting the support email at [norppa@helsinki.fi](mailto:norppa@helsinki.fi) or by [creating an issue in GitHub](https://github.com/UniversityOfHelsinkiCS/palaute/issues/new). We are glad to receive suggestions on how to improve the accessibility of Norppa.

If you are not satisfied with the answer or do not receive an answer within two weeks, you may [submit a complaint](https://www.saavutettavuusvaatimukset.fi/en/user-rights/submit-complaint-web-accessibility-or-request-clarification) to the Finnish Transport and Communications Agency Traficom. The linked Traficom website contains information on how to submit a complaint and how the matter is processed.

**Finnish Transport and Communications Agency Traficom  
Digital Accessibility Supervision Unit**  
www.webaccessibility.fi  
saavutettavuus@traficom.fi  
telephone switchboard 029 534 5000

**Liikenne- ja viestintävirasto Traficom  
Digitaalisen esteettömyyden ja saavutettavuuden valvontayksikkö**  
www.saavutettavuusvaatimukset.fi  
saavutettavuus@traficom.fi  
puhelinnumero vaihde 029 534 5000

**Transport- och kommunikationsverket Traficom  
Enheten för tillsyn över digital tillgänglighet**  
www.tillganglighetskrav.fi  
tillganglighet@traficom.fi  
telefonnummer växeln 029 534 5000
